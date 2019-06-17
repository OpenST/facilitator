import { Subscription } from 'apollo-client/util/Observable';
import { Config } from './Config';
import GraphClient from './GraphClient';

/**
 * The class defines properties and behaviour of a facilitator.
 */
export default class Facilitator {
  private config: Config;

  private dbConnection: any;

  private querySubscriptions: Subscription[];

  // Replace it with subgraph endpoint from config after it's populated.
  private subGraphEndPoint = 'http://localhost:8000/subgraphs/name/openst/ost-composer';

  /**
   * Facilitator class constructor.
   *
   * @param {string} config Config class object.
   * @param {object} dbConnection DB connection object.
   */
  public constructor(config: Config, dbConnection: any) {
    this.config = config;
    this.dbConnection = dbConnection;
    this.querySubscriptions = [];
  }

  /**
   * Starts the facilitator and subscribes to subgraphs.
   *
   * @return Promise<void>
   */
  public async start() {
    const graphClient = new GraphClient(this.subGraphEndPoint);

    // Loops through all subscription queries and subscribe to them
    for (let i = 0; i < this.getSubscriptionQueries.length; i++) {
      const subscriptionQry = this.getSubscriptionQueries[i];
      this.querySubscriptions[i] = await graphClient.subscribe(subscriptionQry);
    }
  }

  /**
   * Stops the facilitator and unsubscribe to query subscriptions.
   * This function should be called on signint or control-c.
   *
   * @return Promise<void>
   */
  public async stop() {
    for (let i = 0; i < this.querySubscriptions.length; i++) {
      const querySubscription = this.querySubscriptions[i];
      await querySubscription.unsubscribe();
    }
  }

  /**
   * List of all queries to subscribe.
   *
   * @return {string[]} List of subscription queries
   */
  private getSubscriptionQueries() {
    return ['subscription{stakeRequesteds{id}}'];
  }
}
