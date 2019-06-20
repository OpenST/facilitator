import { Subscription } from 'apollo-client/util/Observable';
import GraphClient from './GraphClient';

/**
 * Subscriber class subscribes and unsubscribes subscription queries of a subgraph.
 */
export default class Subscriber {
  public querySubscriptions: Subscription[];

  private subscriptionQueries: string[];

  private graphClient: GraphClient;

  /**
   * Constructor
   *
   * @params {string} subGraphEndPoint Sub graph endpoint.
   * @param {string[]} subscriptionQueries Array of subscription queries.
   */
  public constructor(graphClient: GraphClient, subscriptionQueries: string[]) {
    this.querySubscriptions = [];
    this.subscriptionQueries = subscriptionQueries;
    this.graphClient = graphClient;
  }

  /**
   * Subscribes to subscription queries.
   *
   * @return {Promise<void>}
   */
  public async subscribe() {
    for (let i = 0; i < this.subscriptionQueries.length; i++) {
      this.querySubscriptions[i] = await this.graphClient.subscribe(
        this.subscriptionQueries[i],
      );
    }
  }

  /**
   * Unsubscribes the query subscribers and deletes the query subscribers
   * object.
   *
   * @return {Promise<void>}
   */
  public async unsubscribe() {
    for (let i = 0; i < this.querySubscriptions.length; i++) {
      const querySubscription = this.querySubscriptions[i];
      await querySubscription.unsubscribe();
    }
    // Deletes all query susbcribers as they are non useful
    this.querySubscriptions.splice!(0, this.querySubscriptions.length);
  }
}
