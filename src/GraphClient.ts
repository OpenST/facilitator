import ApolloClient from 'apollo-client';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import gql from 'graphql-tag';

import WebSocket = require('ws');

/**
 * The class interacts with graph node server for subscription and query.
 */
export default class GraphClient {
  private subgraphEndPoint: string;

  /**
   * GraphClient constructor.
   *
   * @param {string} subgraphEndPoint Subgraph http/ws end point.
   */
  public constructor(subgraphEndPoint: string) {
    this.subgraphEndPoint = subgraphEndPoint;
  }

  /**
   * Subscribes to the input subscription subgraph query and delegates the response
   * to observer i.e. TransactionHandler.
   * Documentation: https://www.apollographql.com/docs/react/advanced/subscriptions/
   *
   * @param Subscription Subscription query object.
   * @return `Subscription` Query subscription object
   */
  public subscribe(subscriptionQry: string) {
    // GraphQL query that is parsed into the standard GraphQL AST(Abstract syntax tree)
    const gqlSubscriptionQry = gql`${subscriptionQry}`;
    // Subscription handling
    const querySubscriber = this.getClient().subscribe({
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
   * Creates an apollo client.
   *
   * @return {ApolloClient<NormalizedCacheObject>}
   */
  private getClient() {
    // Creates a WebSocket link.
    const wsLink = new WebSocketLink(this.getSubscriptionClient());
    // Instantiate in memory cache object.
    const cache = new InMemoryCache();
    // Instantiate apollo client
    return new ApolloClient({ link: wsLink, cache });
  }

  /**
   * Creates and returns SubscriptionClient.
   *
   * @return {SubscriptionClient}
   */
  private getSubscriptionClient() {
    // Creates subscription client
    const subscriptionClient = new SubscriptionClient(this.subgraphEndPoint, {
      reconnect: true,
    },
    WebSocket);
    return subscriptionClient;
  }
}
