// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------


import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { Subscription } from 'apollo-client/util/Observable';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';
import fetch from 'node-fetch';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import WebSocket from 'ws';

import Logger from '../../common/Logger';
import ContractEntity, { EntityType } from '../../common/models/ContractEntity';
import ContractEntityRepository from '../../common/repositories/ContractEntityRepository';
import TransactionHandler from '../TransactionHandler';
import TransactionFetcher from './TransactionFetcher';
import Utils from '../Utils';

/**
 * The class interacts with graph node server for subscription and query.
 */
export default class GraphClient {
  private apolloClient: ApolloClient<NormalizedCacheObject>;

  /**
   * GraphClient constructor. It expects apollo client as input. Apollo Client is a fully-featured,
   * production ready caching GraphQL client for every UI framework and GraphQL server.
   *
   * @param {ApolloClient<NormalizedCacheObject>} apolloClient Apollo client for subscription.
   */
  public constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
  ) {
    this.apolloClient = apolloClient;
  }

  /**
   * Subscribes to the input subscription subgraph query and delegates the response
   * to observer i.e. TransactionHandler.
   * Documentation: https://www.apollographql.com/docs/react/advanced/subscriptions/
   *
   * @param subscriptionQry Subscription query.
   * @param handler Transaction handler object.
   * @param fetcher Transaction fetcher object.
   * @param contractEntityRepository Instance of contract entity repository.
   * @return Query subscription object.
   */
  public async subscribe(
    subscriptionQry: string,
    handler: TransactionHandler,
    fetcher: TransactionFetcher,
    contractEntityRepository: ContractEntityRepository,
  ): Promise<Subscription> {
    if (!subscriptionQry) {
      const err = new TypeError("Mandatory Parameter 'subscriptionQry' is missing or invalid.");
      throw (err);
    }
    // GraphQL query that is parsed into the standard GraphQL AST(Abstract syntax tree)
    const gqlSubscriptionQry = gql`${subscriptionQry}`;
    // Subscription handling
    const observable = this.apolloClient.subscribe({
      query: gqlSubscriptionQry,
      variables: {},
      fetchPolicy: 'no-cache',
    });
    const querySubscriber = await Promise.resolve(
      observable
        .subscribe({
          async next(response: Record<string, any>) {
            try {
              Logger.debug(`Received subscription data ${JSON.stringify(response.data)}`);

              const entity = Object.keys(response.data);
              if (entity.length === 0 || response.data[entity[0]].length === 0) {
                Logger.info('Skipping transaction fetcher as zero records received');
                return;
              }
              const transactions: Record<string,
              Record<string, any>[]> = await fetcher.fetch(response.data);
              await handler.handle(transactions);
              Logger.debug('Updating UTS');
              await GraphClient.updateLatestUTS(
                transactions,
                response.data,
                contractEntityRepository,
              );
              Logger.debug('Observer flow completed.');
            } catch (e) {
              Logger.error(`Error in observer  ${e}`);
            }
          },
          error(err) {
            Logger.error(`Observer error: ${err}`);
          },
          complete() {
            Logger.info(`Completed subscription flow for subscriptionQry: ${subscriptionQry}`);
          },
        }),
    );

    return querySubscriber;
  }

  /**
   * This method updates latest timestamp for contract entities.
   * @param transactions Transactions for transaction fetcher.
   * @param subscriptionResponse Subscription response.
   * @param contractEntityRepository Instance of contract entity repository.
   */
  private static async updateLatestUTS(
    transactions: Record<string, Record<string, any>[]>,
    subscriptionResponse: Record<string, any[]>,
    contractEntityRepository: ContractEntityRepository,
  ): Promise<void> {
    const savePromises = Object.keys(transactions).map(
      async (transactionKind) => {
        const { contractAddress } = subscriptionResponse[transactionKind][0];
        const transaction = transactions[transactionKind].length > 0
          ? transactions[transactionKind][transactions[transactionKind].length - 1]
          : null;

        // Do nothing if there is no transaction for a transaction kind.
        if (transaction === null) {
          return Promise.resolve();
        }
        const currentUTS = new BigNumber(transaction.uts);
        Logger.debug(`Updating UTS to ${currentUTS} for entity ${transactionKind}`);
        const contractEntity = new ContractEntity(
          Utils.toChecksumAddress(contractAddress),
          transactionKind as EntityType,
          currentUTS,
        );
        return contractEntityRepository.save(
          contractEntity,
        );
      },
    );

    await Promise.all(savePromises);
  }

  /**
   * Query the graph node.
   *
   * @param query Graph query.
   * @return Response from graph node.
   */
  public async query(query: string, variables: Record<string, any>):
  Promise<{data: Record<string, object[]>}> {
    const gqlQuery = gql`${query}`;
    const queryResult = await this.apolloClient.query({
      query: gqlQuery,
      variables,
      fetchPolicy: 'no-cache',
    });

    return queryResult;
  }

  /**
   * Creates and returns graph client.
   *
   * @param linkType LinkType ws/http.
   * @param subgraphEndPoint Subgraph endpoint.
   * @return Graph client object.
   */
  public static getClient(linkType: string, subgraphEndPoint: string): GraphClient {
    let link;
    if (linkType === 'ws') {
      // Creates subscription client
      const subscriptionClient = new SubscriptionClient(subgraphEndPoint, {
        reconnect: true,
      },
      WebSocket);

      GraphClient.attachSubscriptionClientCallbacks(subscriptionClient);
      // Creates WebSocket link.
      link = new WebSocketLink(subscriptionClient);
    } else {
      // Creates http link
      // fetch is defined as any because of below issue
      // More details: https://maecapozzi.com/using-node-fetch-with-apollo-link-http/
      // Github issue: https://github.com/apollographql/apollo-client/issues/4857
      link = createHttpLink({ uri: subgraphEndPoint, fetch: fetch as any });
    }
    // Instantiate in memory cache object.
    const cache = new InMemoryCache();
    // Instantiate apollo client
    const apolloClient = new ApolloClient({ link, cache });
    // Creates and returns graph client
    return new GraphClient(apolloClient);
  }

  /**
   * This method adds callback to subscription client. Currently, it logs the
   * different callbacks. In future these callbacks, can be useful to design error
   * handling and retry mechanisms.
   *
   * @param subscriptionClient Instance of subscription client.
   */
  private static attachSubscriptionClientCallbacks(subscriptionClient: SubscriptionClient) {
    subscriptionClient.onConnected(() => {
      Logger.info('Connected to the graph node');
    });
    subscriptionClient.onReconnected(() => {
      Logger.info('Reconnected to the graph node');
    });
    subscriptionClient.onConnecting(() => {
      Logger.info('Connecting to the graph node');
    });
    subscriptionClient.onReconnecting(() => {
      Logger.info('Reconnecting to the graph node');
    });
    subscriptionClient.onDisconnected(() => {
      Logger.info('Disconnected to the graph node');
    });
    subscriptionClient.onError((error) => {
      Logger.error(`Error connecting to graph node. Reason: ${error.message}`);
    });
  }
}
