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
   * Starts the facilitator, creates graph client object and subscribes to subscription queries.
   *
   * @return Promise<void>
   */
  public async start() {
    const subGraphDetails = this.getSubGraphDetails();
    for (let chainType in subGraphDetails) {
      const subGraphInfo = subGraphDetails[chainType];
      const graphClient = new GraphClient(subGraphInfo.subGraphEndPoint);
      const subscriptionQueries = subGraphInfo.subscriptionQueries;
      // Subscribe to all subscription queries for a facilitator
      for (let i = 0; i < subscriptionQueries.length; i++) {
        this.querySubscriptions[i] = await graphClient.subscribe(subscriptionQueries[i]);
      }
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
   * Add GQL queries needed for the model/services.
   * Replace it with subgraph endpoint from config after it's populated.
   * Populate subscription queries
   *
   * @return {string[]} List of subscription queries.
   */
  private getSubGraphDetails() {
    return {
      origin: {
        subGraphEndPoint: 'http://localhost:8000/subgraphs/name/openst/ost-composer',
        subscriptionQueries: ['subscription{stakeRequesteds{id amount beneficiary gasLimit' +
        ' gasPrice gateway nonce staker stakeRequestHash }}'],
      },
      auxiliary: {
        subGraphEndPoint: 'http://localhost:8000/subgraphs/name/openst/auxiliary',
        subscriptionQueries: ['subscription{stakeRequesteds{id}}'],
      }
    };
  }
}
