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


import ContractEntityRepository from '../repositories/ContractEntityRepository';
import GraphClient from './GraphClient';
import Subscriber from './Subscriber';
import TransactionFetcher from './TransactionFetcher';
import TransactionHandlerInterface from '../TransactionHandlerInterface';

/**
 * This class is container that holds instances of all the subscriptions.
 */
export default class Subscriptions {
  public readonly originSubscriber: Subscriber;

  public readonly auxiliarySubscriber: Subscriber;

  /**
   * @param originSubscriber Instance of origin subscriber.
   * @param auxiliarySubscriber Instance of auxiliary subscriber.
   */
  private constructor(originSubscriber: Subscriber, auxiliarySubscriber: Subscriber) {
    this.originSubscriber = originSubscriber;
    this.auxiliarySubscriber = auxiliarySubscriber;
  }

  /** This is a factory method to create subscription container. */
  public static async create(
    transactionHandler: TransactionHandlerInterface,
    contractEntityRepository: ContractEntityRepository,
    fetchQueries: Record<string, string>,
    originSubGraphWs: string,
    originSubGraphRpc: string,
    originSubscriptionQueries: Record<string, string>,
    auxiliarySubGraphWs: string,
    auxiliarySubGraphRpc: string,
    auxiliarySubscriptionQueries: Record<string, string>,
  ): Promise<Subscriptions> {
    const originTransactionFetcher: TransactionFetcher = new TransactionFetcher(
      GraphClient.getClient(
        'http',
        originSubGraphRpc,
      ),
      contractEntityRepository,
      fetchQueries,
    );
    // Subscription to origin subgraph queries
    const originSubscriber = new Subscriber(
      GraphClient.getClient('ws', originSubGraphWs),
      originSubscriptionQueries,
      transactionHandler,
      originTransactionFetcher,
      contractEntityRepository,
    );
    // Subscription to auxiliary subgraph queries
    const auxiliaryTransactionFetcher: TransactionFetcher = new TransactionFetcher(
      GraphClient.getClient('http', auxiliarySubGraphRpc),
      contractEntityRepository,
      fetchQueries,
    );
    const auxiliarySubscriber = new Subscriber(
      GraphClient.getClient('ws', auxiliarySubGraphWs),
      auxiliarySubscriptionQueries,
      transactionHandler,
      auxiliaryTransactionFetcher,
      contractEntityRepository,
    );
    return new Subscriptions(originSubscriber, auxiliarySubscriber);
  }
}
