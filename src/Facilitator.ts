import { Config } from './Config';
import Subscriber from './Subscriber';
import GraphClient from './GraphClient';
import TransactionHandler from './TransactionHandler';
import HandlerFactory from './handlers/HandlerFactory';
import Database from './models/Database';

/**
 * The class defines properties and behaviour of a facilitator.
 */
export default class Facilitator {
  public readonly config: Config;

  private originSubscriber?: Subscriber;

  private auxiliarySubscriber?: Subscriber;

  /**
   * Facilitator class constructor.
   *
   * @param {string} config Config class object.
   */
  public constructor(config: Config) {
    this.config = config;
  }

  /**
   * Starts the facilitator by subscribing to subscription queries.
   *
   * @return Promise<void>
   */
  public async start(): Promise<void> {
    const subGraphDetails = Facilitator.getSubscriptionDetails();
    const database = await Database.create(this.config.facilitator.database.path);
    const transactionalHandler: TransactionHandler = new TransactionHandler(
      HandlerFactory.get(database),
    );
    // Subscription to origin subgraph queries
    this.originSubscriber = new Subscriber(
      GraphClient.getClient(subGraphDetails.origin.subGraphEndPoint),
      subGraphDetails.origin.subscriptionQueries,
      transactionalHandler,
    );
    await this.originSubscriber.subscribe();

    // Subscription to auxiliary subgraph queries
    this.auxiliarySubscriber = new Subscriber(
      GraphClient.getClient(subGraphDetails.auxiliary.subGraphEndPoint),
      subGraphDetails.auxiliary.subscriptionQueries,
      transactionalHandler,
    );
    await this.auxiliarySubscriber.subscribe();
  }

  /**
   * Stops the facilitator and unsubscribe to query subscriptions.
   * This function should be called on signint or control-c.
   *
   * @return Promise<void>
   */
  public async stop(): Promise<void> {
    await this.originSubscriber!.unsubscribe();
    await this.auxiliarySubscriber!.unsubscribe();
  }

  /**
   * Subgraph details object which contains chain based subGraphEndPoitn & subscriptionQueries.
   * Note: Replace subGraphEndPoint from Config.ts. It should come from Config:Chain class.
   * Feel free to add subscription queries.
   *
   * @return <any> Object containing chain based subscriptionQueries.
   */
  public static getSubscriptionDetails(): any {
    return {
      origin: {
        subGraphEndPoint: 'ws://localhost:8000/subgraphs/name/openst/ost-composer',
        subscriptionQueries: {
          stakeRequested: 'subscription{stakeRequesteds{id amount'
          + ' beneficiary gasLimit gasPrice gateway nonce staker stakeRequestHash}}',
        },
      },
      auxiliary: {
        subGraphEndPoint: 'ws://localhost:8000/subgraphs/name/openst/ost-composer',
        subscriptionQueries: { stakeRequested: 'subscription{stakeRequesteds{id}}' },
      },
    };
  }
}
