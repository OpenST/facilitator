/* eslint-disable no-await-in-loop, guard-for-in, no-restricted-syntax */

import { Subscription } from 'apollo-client/util/Observable';
import GraphClient from './GraphClient';

/**
 * Subscriber class subscribes and unsubscribes subscription queries of a subgraph.
 */
export default class Subscriber {
  public querySubscriptions: Record<string, Subscription>;

  private subscriptionQueries: Record<string, string>;

  private graphClient: GraphClient;

  /**
   * Constructor
   *
   * @params {GraphClient} graphClient Graph client instance.
   * @param {Record<string, string>} subscriptionQueries Object of subscription queries.
   */
  public constructor(graphClient: GraphClient, subscriptionQueries: Record<string, string>) {
    this.querySubscriptions = {};
    this.subscriptionQueries = subscriptionQueries;
    this.graphClient = graphClient;
  }

  /**
   * Subscribes to subscription queries.
   *
   * @return {Promise<void>}
   */
  public async subscribe() {
    for (const key in this.subscriptionQueries) {
      this.querySubscriptions[key] = await this.graphClient.subscribe(
        this.subscriptionQueries[key],
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
