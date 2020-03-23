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

import Logger from '../Logger';
import ContractEntityRepository from '../repositories/ContractEntityRepository';
import TransactionHandlerInterface from '../TransactionHandlerInterface';
import GraphClient from './GraphClient';
import TransactionFetcher from './TransactionFetcher';

/**
 * Subscriber class subscribes and unsubscribes subscription queries of a subgraph.
 */
export default class Subscriber {
  public querySubscriptions: Record<string, Subscription>;

  private subscriptionQueries: Record<string, string>;

  private graphClient: GraphClient;

  private handler: TransactionHandlerInterface;

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
    handler: TransactionHandlerInterface,
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
      async (entity): Promise<void> => {
        Logger.debug(`Subscriber::Subscribing to entity: ${entity}`);
        return this.graphClient.subscribe(
          this.subscriptionQueries[entity],
          this.handler,
          this.fetcher,
          this.contractEntityRepository,
        ).then((querySubscription): void => {
          Logger.debug(`Subscriber::Subscription done for entity: ${entity}`);
          this.querySubscriptions[entity] = querySubscription;
        });
      },
    );
    return Promise.all(subscriptionPromises);
  }

  /** Unsubscribes the query subscribers and deletes the query subscribers object. */
  public async unsubscribe(): Promise<void> {
    Object.keys(this.subscriptionQueries).forEach(async (entity): Promise<void> => {
      Logger.debug(`Subscriber::Unsubscribing to graph node entity ${entity}`);
      const querySubscription = this.querySubscriptions[entity];
      if (querySubscription) {
        querySubscription.unsubscribe();
      }
      Logger.debug(`Subscriber::Unsubscribed to graph node entity ${entity}.`);
    });
    // Deletes all query subscribers as they are non useful.
    this.querySubscriptions = {};
  }
}
