// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------


import { Subscription } from 'apollo-client/util/Observable';

import Logger from '../../common/Logger';
import ContractEntityRepository from '../../common/repositories/ContractEntityRepository';
import TransactionHandler from '../TransactionHandler';
import GraphClient from './GraphClient';
import TransactionFetcher from './TransactionFetcher';

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
  public async subscribe(): Promise<void[]> {
    const subscriptionPromises = Object.keys(this.subscriptionQueries).map(
      async (entity) => {
        Logger.debug(`Subscribing for entity: ${entity}`);
        return this.graphClient.subscribe(
          this.subscriptionQueries[entity],
          this.handler,
          this.fetcher,
          this.contractEntityRepository,
        ).then((querySubscription) => {
          Logger.debug(`Subscription done for entity: ${entity}`);
          this.querySubscriptions[entity] = querySubscription;
        });
      },
    );
    return Promise.all(subscriptionPromises);
  }

  /** Unsubscribes the query subscribers and deletes the query subscribers object. */
  public async unsubscribe() {
    Object.keys(this.subscriptionQueries).forEach(async (entity) => {
      Logger.debug(`Unsubscribing to block chain entity ${entity}`);
      const querySubscription = this.querySubscriptions[entity];
      querySubscription.unsubscribe();
      Logger.debug(`Unsubscribed to block chain entity ${entity}.`);
    });
    // Deletes all query susbcribers as they are non useful.
    this.querySubscriptions = {};
  }
}
