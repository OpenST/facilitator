// Copyright 2020 OpenST Ltd.
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


import { SUBSCRIPTION_RESTART_DURATION } from '../common/Constants';
import Logger from '../common/Logger';
import Subscriber from '../common/subscriptions/Subscriber';

import TransactionExecutor from './lib/TransactionExecutor';

/** The class defines properties and behavior of a facilitator. */
export default class Facilitator {
  private readonly originTransactionExecutor: TransactionExecutor;

  private readonly auxiliaryTransactionExecutor: TransactionExecutor;

  private readonly originSubscriber: Subscriber;

  private readonly auxiliarySubscriber: Subscriber;

  private subscriptionRestartHandle: NodeJS.Timer | null;

  /**
   * @param originTransactionExecutor Instance of origin transaction executor.
   * @param auxiliaryTransactionExecutor Instance of auxiliary transaction executor.
   * @param originSubscriber Origin subscriber instance.
   * @param auxiliarySubscriber Auxiliary subscriber instance.
   */
  public constructor(
    originTransactionExecutor: TransactionExecutor,
    auxiliaryTransactionExecutor: TransactionExecutor,
    originSubscriber: Subscriber,
    auxiliarySubscriber: Subscriber,
  ) {
    this.originTransactionExecutor = originTransactionExecutor;
    this.auxiliaryTransactionExecutor = auxiliaryTransactionExecutor;
    this.originSubscriber = originSubscriber;
    this.auxiliarySubscriber = auxiliarySubscriber;
    this.subscriptionRestartHandle = null;
  }

  /**
   * Starts the facilitator by subscribing to subscription queries and
   * starting the transaction executor.
   */
  public async start(): Promise<void> {
    await this.originTransactionExecutor.start();
    await this.auxiliaryTransactionExecutor.start();

    await this.subscribeToSubGraphs();
    this.subscriptionRestartHandle = setInterval(
      async (): Promise<void> => this.restartSubscription(),
      SUBSCRIPTION_RESTART_DURATION,
    );
  }

  /**
   * Stops the facilitator by unsubscribe to query subscriptions and stopping
   * the transaction executor.
   * This function should be called on signint or control-c.
   */
  public async stop(): Promise<void> {
    await this.originTransactionExecutor.stop();
    await this.auxiliaryTransactionExecutor.stop();

    if (this.subscriptionRestartHandle !== null) {
      clearInterval(this.subscriptionRestartHandle);
    }
    await this.unsubscribeToSubGraphs();
  }

  // It restarts the subscription
  private async restartSubscription(): Promise<void> {
    await this.unsubscribeToSubGraphs();
    await this.subscribeToSubGraphs();
  }

  // Subscribes to origin and auxiliary subgraphs
  private async subscribeToSubGraphs(): Promise<void> {
    Logger.info('Facilitator::Starting subscription to graph node entities');
    await this.originSubscriber.subscribe();
    Logger.info('Facilitator::Subscription to origin graph node is done');
    await this.auxiliarySubscriber.subscribe();
    Logger.info('Facilitator::Subscription to auxiliary graph node is done');
  }

  // Unsubscribes to origin and auxiliary subgraphs
  private async unsubscribeToSubGraphs(): Promise<void> {
    Logger.info('Facilitator::Stopping subscription to graph node entities');
    await this.originSubscriber.unsubscribe();
    Logger.info('Facilitator::Unsubscribed to origin graph node.');
    await this.auxiliarySubscriber.unsubscribe();
    Logger.info('Facilitator::Unsubscribed to auxiliary graph node.');
  }
}
