import { Config } from './Config';
import Subscriber from './Subscriber';
import GraphClient from './GraphClient';

/**
 * The class defines properties and behaviour of a facilitator.
 */
export default class Facilitator {
  readonly config: Config;

  private dbConnection: any;

  private originSubscriber: Subscriber;

  private auxiliarySubscriber: Subscriber;

  /**
   * Facilitator class constructor.
   *
   * @param {string} config Config class object.
   * @param {object} dbConnection DB connection object.
   */
  public constructor(config: Config, dbConnection: any) {
    this.config = config;
    this.dbConnection = dbConnection;
  }

  /**
   * Starts the facilitator by subscribing to subscription queries.
   *
   * @return Promise<void>
   */
  public async start() {
    const subGraphDetails = Facilitator.getSubscriptionDetails();

    // Subscription to origin subgraph queries
    this.originSubscriber = new Subscriber(
      GraphClient.getClient(subGraphDetails.origin.subGraphEndPoint),
      Object.values(subGraphDetails.origin.subscriptionQueries),
    );
    await this.originSubscriber.subscribe();

    // Subscription to auxiliary subgraph queries
    this.auxiliarySubscriber = new Subscriber(
      GraphClient.getClient(subGraphDetails.auxiliary.subGraphEndPoint),
      Object.values(subGraphDetails.auxiliary.subscriptionQueries),
    );
    await this.auxiliarySubscriber.subscribe();
  }

  /**
   * Stops the facilitator and unsubscribe to query subscriptions.
   * This function should be called on signint or control-c.
   *
   * @return Promise<void>
   */
  public async stop() {
    await this.originSubscriber.unsubscribe();
    await this.auxiliarySubscriber.unsubscribe();
  }

  /**
   * Subgraph details object which contains chain based subGraphEndPoitn & subscriptionQueries.
   * Note: Replace subGraphEndPoint from Config.ts. It should come from Config:Chain class.
   * Feel free to add subscription queries.
   *
   * @return <any> Object containing chain based subscriptionQueries.
   */
  public static getSubscriptionDetails() {
    return {
      origin: {
        subGraphEndPoint: 'ws://localhost:8000/subgraphs/name/openst/ost-composer',
        subscriptionQueries: {
          stakeRequested: 'subscription{stakeRequesteds{id amount'
          + ' beneficiary gasLimit gasPrice gateway nonce staker stakeRequestHash }}',
        },
      },
      auxiliary: {
        subGraphEndPoint: 'ws://localhost:8000/subgraphs/name/openst/ost-composer',
        subscriptionQueries: { stakeRequested: 'subscription{stakeRequesteds{id}}' },
      },
    };
  }
}
