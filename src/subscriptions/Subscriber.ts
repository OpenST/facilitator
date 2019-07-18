import { Subscription } from 'apollo-client/util/Observable';
import GraphClient from './GraphClient';
import TransactionHandler from '../TransactionHandler';
import TransactionFetcher from './TransactionFetcher';
import ContractEntityRepository from '../repositories/ContractEntityRepository';
import Logger from '../Logger';

/**
 * Subscriber class subscribes and unsubscribes subscription queries of a subgraph.
 */
export default class Subscriber {
  public querySubscriptions: Record<string, Subscription>;

  private subscriptionQueries: Record<string, string>;

  private graphClient: GraphClient;

  private handler: TransactionHandler;

  private contractEntityRepository: ContractEntityRepository;

  private fetcher: TransactionFetcher;

  /**
   * Constructor
   *
   * @param graphClient Graph client instance.
   * @param subscriptionQueries Object of subscription queries.
   * @param handler Instance of transaction handler.
   * @param fetcher Instance of TransactionFetcher class.
   * @param contractEntityRepository Instance of contract entity repository.
   */
  public constructor(
    graphClient: GraphClient,
    subscriptionQueries: Record<string, string>,
    handler: TransactionHandler,
    fetcher: TransactionFetcher,
    contractEntityRepository: ContractEntityRepository,

  ) {
    this.contractEntityRepository = contractEntityRepository;
    this.querySubscriptions = {};
    this.subscriptionQueries = subscriptionQueries;
    this.graphClient = graphClient;
    this.handler = handler;
    this.fetcher = fetcher;
  }

  /** Subscribes to subscription queries. */
  public async subscribe() {
    Object.keys(this.subscriptionQueries).forEach(async (entity) => {
      Logger.debug(`Subscribing to block chain entity ${entity}`);
      this.querySubscriptions[entity] = await this.graphClient.subscribe(
        this.subscriptionQueries[entity],
        this.handler,
        this.fetcher,
        this.contractEntityRepository,
      );
      Logger.debug(`Subscription to block chain entity ${entity} is done`);
    });
  }

  /**
   * Unsubscribes the query subscribers and deletes the query subscribers object.
   *
   * @return {Promise<void>}
   */
  public async unsubscribe() {
    Object.keys(this.subscriptionQueries).forEach(async (entity) => {
      Logger.debug(`Unsubscribing to block chain entity ${entity}`);
      const querySubscription = this.querySubscriptions[entity];
      await Promise.resolve(querySubscription.unsubscribe());
      Logger.debug(`Unsubscribed to block chain entity ${entity}.`);
    });
    // Deletes all query susbcribers as they are non useful
    this.querySubscriptions = {};
  }
}
