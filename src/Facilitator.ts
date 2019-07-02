import { Config } from './Config';
import Subscriber from './Subscriber';
import GraphClient from './GraphClient';
import TransactionHandler from './TransactionHandler';
import HandlerFactory from './handlers/HandlerFactory';
import Database from './models/Database';
import TransactionFetcher from './TransactionFetcher';
import {SubscriptionInfo} from './types';

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
    const originTransactionFetcher: TransactionFetcher = new TransactionFetcher(
      GraphClient.getClient('http', subGraphDetails.origin.httpSubGraphEndPoint),
    );
    // Subscription to origin subgraph queries
    this.originSubscriber = new Subscriber(
      GraphClient.getClient('ws', subGraphDetails.origin.wsSubGraphEndPoint),
      subGraphDetails.origin.subscriptionQueries,
      transactionalHandler,
      originTransactionFetcher,
    );
    await this.originSubscriber.subscribe();

    // Subscription to auxiliary subgraph queries
    const auxiliaryTransactionFetcher: TransactionFetcher = new TransactionFetcher(
      GraphClient.getClient('http', subGraphDetails.auxiliary.httpSubGraphEndPoint),
    );
    this.auxiliarySubscriber = new Subscriber(
      GraphClient.getClient('ws', subGraphDetails.auxiliary.wsSubGraphEndPoint),
      subGraphDetails.auxiliary.subscriptionQueries,
      transactionalHandler,
      auxiliaryTransactionFetcher,
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
  public static getSubscriptionDetails(): SubscriptionInfo {
    return {
      origin: {
        wsSubGraphEndPoint: 'ws://localhost:8000/subgraphs/name/openst/ost-composer',
        httpSubGraphEndPoint: 'http://localhost:8000/subgraphs/name/openst/ost-composer',
        subscriptionQueries: {
          stakeRequested: 'subscription{stakeRequesteds(orderDirection: desc, first: 1){' +
          '   id' +
          '   contractAddress ' +
          '  }' +
          '}',
        },
      },
      auxiliary: {
        wsSubGraphEndPoint: 'ws://localhost:8000/subgraphs/name/openst/ost-composer',
        httpSubGraphEndPoint: 'http://localhost:8000/subgraphs/name/openst/ost-composer',
        subscriptionQueries: {
          stakeRequested: 'subscription{stakeRequesteds(orderDirection: desc, first: 1){' +
          '   id' +
          '   contractAddress ' +
          '  }' +
          '}',
        },
      },
    };
  }
}
