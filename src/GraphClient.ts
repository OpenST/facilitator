import ApolloClient from 'apollo-client';
import { WebSocketLink } from 'apollo-link-ws';
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { Subscription } from 'apollo-client/util/Observable';
import gql from 'graphql-tag';
import * as WebSocket from 'ws'
import fetch from 'node-fetch';

import Logger from './Logger';
import TransactionHandler from './TransactionHandler';

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
  public constructor(apolloClient: ApolloClient<NormalizedCacheObject>) {
    this.apolloClient = apolloClient;
  }

  /**
   * Subscribes to the input subscription subgraph query and delegates the response
   * to observer i.e. TransactionHandler.
   * Documentation: https://www.apollographql.com/docs/react/advanced/subscriptions/
   *
   * @param {string} subscriptionQry Subscription query.
   * @param {TransactionHandler} handler Transaction handler object.
   * @return {Subscription} Query subscription object.
   */
  public subscribe(subscriptionQry: string, handler: TransactionHandler): Subscription {
    if (!subscriptionQry) {
      const err = new TypeError("Mandatory Parameter 'subscriptionQry' is missing or invalid.");
      throw (err);
    }
    // GraphQL query that is parsed into the standard GraphQL AST(Abstract syntax tree)
    const gqlSubscriptionQry = gql`${subscriptionQry}`;
    // Subscription handling
    const querySubscriber = this.apolloClient.subscribe({
      query: gqlSubscriptionQry,
      variables: {},
    }).subscribe({
      next(response) {
        handler.handle(response);
      },
      error(err) {
        // Log error using logger
        Logger.error(err);
      },
    });

    return querySubscriber;
  }

  /**
   * Query the graph node.
   *
   * @param query Graph query.
   * @return Promise<{data: object}>
   */
  public async query(query: string):Promise<{data: object}> {
    const gqlQuery = gql`${query}`;
    const queryResult = await this.apolloClient.query({query: gqlQuery});

    return queryResult;
  }

  /**
   * Creates and returns graph client.
   *
   * @param {string} wsSubgraphEndPoint Subgraph endpoint.
   * @return {GraphClient}
   */
  public static getClientWithWsLink(wsSubgraphEndPoint: string): GraphClient {
    // Creates subscription client
    const subscriptionClient = new SubscriptionClient(wsSubgraphEndPoint, {
      reconnect: true,
    },
    WebSocket);
    // Creates WebSocket link.
    const wsLink = new WebSocketLink(subscriptionClient);
    // Instantiate in memory cache object.
    const cache = new InMemoryCache();
    // Instantiate apollo client
    const apolloClient = new ApolloClient({ link: wsLink, cache });
    // Creates and returns graph client
    return new GraphClient(apolloClient);
  }

  /**
   * Returns Graph client with http link. Queries are done on http connection.
   *
   * @param httpSubGraphEndPoint subgraph end point.
   * @return {GraphClient}
   */
  public static getClientWithHttpLink(httpSubGraphEndPoint: string): GraphClient {
    const link = createHttpLink({ uri: httpSubGraphEndPoint, fetch: fetch });
    const apolloClient = new ApolloClient({link: link, cache: new InMemoryCache()});

    return new GraphClient(apolloClient);
  }
}
