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
    const oThis = this;
    const subscriptionPromises = Object.keys(this.subscriptionQueries).map(
      async entity => this.graphClient.subscribe(
        this.subscriptionQueries[entity],
        this.handler,
        this.fetcher,
        this.contractEntityRepository,
      ).then((querySubscription) => {
        Logger.info(`Subscription done for entity: ${entity}`);
        oThis.querySubscriptions[entity] = querySubscription;
      }),
    );
    await Promise.all(subscriptionPromises);
  }

  /** Unsubscribes the query subscribers and deletes the query subscribers object. */
  public async unsubscribe() {
    Object.keys(this.subscriptionQueries).forEach(async (entity) => {
      const querySubscription = this.querySubscriptions[entity];
      querySubscription.unsubscribe();
      Logger.info(`UnSubscription done for entity: ${entity}`);
    });
    // Deletes all query susbcribers as they are non useful.
    this.querySubscriptions = {};
  }
}
