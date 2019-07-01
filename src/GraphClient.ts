import ApolloClient from 'apollo-client';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { Subscription } from 'apollo-client/util/Observable';
import gql from 'graphql-tag';
import * as WebSocket from 'ws';

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
   * Creates and returns graph client.
   *
   * @param {string} subgraphEndPoint Subgraph endpoint.
   * @return {ApolloClient<NormalizedCacheObject>}
   */
  public static getClient(subgraphEndPoint: string): GraphClient {
    // Creates subscription client
    const subscriptionClient = new SubscriptionClient(subgraphEndPoint, {
      reconnect: true,
    },
    WebSocket);

    GraphClient.attachSubscriptionClientCallbacks(subscriptionClient);
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
