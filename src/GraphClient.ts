import ApolloClient from 'apollo-client';
import { WebSocketLink } from 'apollo-link-ws';
import {InMemoryCache, NormalizedCacheObject} from 'apollo-cache-inmemory';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import gql from 'graphql-tag';

import WebSocket = require('ws');

/**
 * The class interacts with graph node server for subscription and query.
 */
export default class GraphClient {
  private apolloClient: ApolloClient<NormalizedCacheObject>;

  /**
   * GraphClient constructor.
   *
   * @param apolloClient Apollo client for subscription.
   */
  public constructor(apolloClient: ApolloClient<NormalizedCacheObject>) {
    this.apolloClient = apolloClient;
  }

  /**
   * Subscribes to the input subscription subgraph query and delegates the response
   * to observer i.e. TransactionHandler.
   * Documentation: https://www.apollographql.com/docs/react/advanced/subscriptions/
   *
   * @param {string} subscriptionQry Subscription query object.
   * @return `Subscription` Query subscription object
   */
  public subscribe(subscriptionQry: string) {
    if( !subscriptionQry ) {
      const err = new TypeError("Mandatory Parameter 'subscriptionQry' is missing or invalid.");
      return Promise.reject(err);
    }
    // GraphQL query that is parsed into the standard GraphQL AST(Abstract syntax tree)
    const gqlSubscriptionQry = gql`${subscriptionQry}`;
    // Subscription handling
    const querySubscriber = this.apolloClient.subscribe({
      query: gqlSubscriptionQry,
      variables: {},
    }).subscribe({
      next(response) {
        // Replace it with TransactionHandler
        console.log(response.data);
      },
      error(err) {
        console.error('error', err);
      },
    });

    return querySubscriber;
  }

  /**
   * Creates and returns apollo client. Apollo Client is a fully-featured caching GraphQL client.
   *
   * @param {string} subgraphEndPoint Subgraph endpoint.
   * @return {ApolloClient<NormalizedCacheObject>}
   */
  public static getApolloClient(subgraphEndPoint: string) {
    // Creates subscription client
    const subscriptionClient = new SubscriptionClient(subgraphEndPoint, {
        reconnect: true,
      },
      WebSocket
    );
    // Creates WebSocket link.
    const wsLink = new WebSocketLink(subscriptionClient);
    // Instantiate in memory cache object.
    const cache = new InMemoryCache();
    // Instantiate apollo client
    return new ApolloClient({ link: wsLink, cache: cache });
  }
}
