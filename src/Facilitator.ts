import { Subscription } from 'apollo-client/util/Observable';
import { Config } from './Config';

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
   * Starts the facilitator by subscribing to subscription queries.
   *
   * @param originSubGraphClient GraphClient Origin chain graph client.
   * @param auxiliarySubGraphClient GraphClient Auxiliary chain graph client.
   * @return Promise<void>
   */
  public async start(originSubGraphClient, auxiliarySubGraphClient) {
    const subGraphDetails = this.getSubscriptionQueries();

    // Subscription to origin queries
    let subscriptionQueries = subGraphDetails.origin.subscriptionQueries;
    for (let i = 0; i < subscriptionQueries.length; i++) {
      this.querySubscriptions[i] = await originSubGraphClient.subscribe(subscriptionQueries[i]);
    }

    subscriptionQueries = subGraphDetails.auxiliary.subscriptionQueries;
    for (let i = 0; i < subscriptionQueries.length; i++) {
      this.querySubscriptions[i] = await auxiliarySubGraphClient.subscribe(subscriptionQueries[i]);
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
   * Subgraph details object which contains chain based subscriptionQueries.
   * Feel free to add subscription queries
   *
   * @return <any> Object containing chain based subscriptionQueries.
   */
  private getSubscriptionQueries() {
    return {
      origin: {
        subscriptionQueries: ['subscription{stakeRequesteds{id amount beneficiary gasLimit' +
        ' gasPrice gateway nonce staker stakeRequestHash }}'],
      },
      auxiliary: {
        subscriptionQueries: ['subscription{stakeRequesteds{id}}'],
      }
    };
  }
}
