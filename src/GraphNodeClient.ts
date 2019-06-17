import ApolloClient from "apollo-client";
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SubscriptionClient } from "subscriptions-transport-ws";
import gql from 'graphql-tag'
import WebSocket = require('ws');

/**
 * The class interacts with graph node server for subscription and query.
 */
export default class GraphNodeClient {
  private subgraphEndPoint: string;

  /**
   * GraphNodeClient constructor.
   * @param {string} subgraphEndPoint Subgraph http/ws end point.
   */
  public constructor(subgraphEndPoint: string) {
    this.subgraphEndPoint = subgraphEndPoint;
  }

  /**
   * Subscribes to the input subscription subgraph query and delegates the response
   * to observable object.
   * Documentation: https://www.apollographql.com/docs/react/advanced/subscriptions/
   * @param subscriptionQry Subscription query.
   */
  public subscribe(subscriptionQry: string) {
    // Write a GraphQL query that is parsed into the standard GraphQL AST(Abstract syntax tree)
    const gqlSubscriptionQry = gql`${subscriptionQry}`;
    // Subscription handling
    this.getClient().subscribe({
      query: gqlSubscriptionQry,
      variables: {}
    }).subscribe({
      next(response) {
        // Replace it with TransactionHandler
        console.log(response.data)
      },
      error(err) {
        console.error("error", err);
      },
    });
  }

  /**
   * Creates apollo client.
   * @return {ApolloClient<NormalizedCacheObject>}
   */
  private getClient() {
    // Creates subscription client
    const subscriptionClient = new SubscriptionClient(this.subgraphEndPoint, {
        reconnect: true
      },
      WebSocket,
    );
    // Creates a WebSocket link.
    const wsLink = new WebSocketLink(subscriptionClient);
    // Instantiate in memory cache object.
    const cache = new InMemoryCache();
    // Instantiate client
    return new ApolloClient({link: wsLink, cache: cache});
  }

}