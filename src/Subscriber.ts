/* eslint-disable no-await-in-loop, guard-for-in, no-restricted-syntax */

import { Subscription } from 'apollo-client/util/Observable';
import GraphClient from './GraphClient';
import TransactionHandler from './TransactionHandler';

/**
 * Subscriber class subscribes and unsubscribes subscription queries of a subgraph.
 */
export default class Subscriber {
  public querySubscriptions: Record<string, Subscription>;

  private subscriptionQueries: Record<string, string>;

  private graphClient: GraphClient;

  private handler: TransactionHandler;

  /**
   * Constructor
   *
   * @params {GraphClient} graphClient Graph client instance.
   * @param {Record<string, string>} subscriptionQueries Object of subscription queries.
   * @param handler Instance of transaction handler.
   */
  public constructor(
    graphClient: GraphClient,
    subscriptionQueries: Record<string, string>,
    handler: TransactionHandler,
  ) {
    this.querySubscriptions = {};
    this.subscriptionQueries = subscriptionQueries;
    this.graphClient = graphClient;
    this.handler = handler;
  }

  /** Subscribes to subscription queries. */
  public async subscribe() {
    for (const key in this.subscriptionQueries) {
      this.querySubscriptions[key] = await this.graphClient.subscribe(
        this.subscriptionQueries[key],
        this.handler,
      );
    }
  }

  /**
   * Unsubscribes the query subscribers and deletes the query subscribers object.
   *
   * @return {Promise<void>}
   */
  public async unsubscribe() {
    for (const key in this.subscriptionQueries) {
      const querySubscription = this.querySubscriptions[key];
      await querySubscription.unsubscribe();
    }
    // Deletes all query susbcribers as they are non useful
    this.querySubscriptions = {};
  }
}
