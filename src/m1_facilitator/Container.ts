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

import BigNumber from 'bignumber.js';

import Subscriptions from '../common/subscriptions/Subscriptions';
import TransactionHandler from '../common/TransactionHandler';

import Facilitator from './Facilitator';
import fetchQueries from './GraphQueries/FetchQueries';
import Handlers from './handlers/Handlers';
import Manifest from './manifest/Manifest';
import Repositories from './repositories/Repositories';
import Services from './services/Services';
import subscriptionQueries from './GraphQueries/SubscriptionQueries';
import TransactionExecutor from './lib/TransactionExecutor';


/**
 * Container class instantiates all components to enable the facilitator.
 * The main components are: repositories, transaction handlers, services,
 * subgraph subscription clients (for origin and auxiliary chains) and
 * transaction executors (for origin and auxiliary chains).
 */
export default class Container {
  /**
   * create() functions instantiates all main components, creates facilitator
   * object and returns it.
   *
   * @param manifest The manifest file of facilitator.
   *
   * @return A faciliator object and repositories container object.
   */
  public static async create(
    manifest: Manifest,
  ): Promise<{ facilitator: Facilitator; repositories: Repositories} > {
    const repositories = await Repositories.create(manifest.dbConfig.path);

    const handlers = Handlers.create(repositories);
    const transactionHandler = new TransactionHandler(
      handlers,
      repositories,
    );

    const originTransactionExecutor = new TransactionExecutor(
      repositories.originTransactionRepository,
      manifest.metachain.originChain.web3,
      new BigNumber(
        await manifest.metachain.originChain.web3.eth.getGasPrice(),
      ),
      manifest.avatarAccounts[manifest.metachain.originChain.avatarAccount],
    );

    const auxiliaryTransactionExecutor = new TransactionExecutor(
      repositories.auxiliaryTransactionRepository,
      manifest.metachain.auxiliaryChain.web3,
      new BigNumber(
        await manifest.metachain.auxiliaryChain.web3.eth.getGasPrice(),
      ),
      manifest.avatarAccounts[manifest.metachain.auxiliaryChain.avatarAccount],
    );

    Services.create(
      manifest,
      repositories,
      originTransactionExecutor,
      auxiliaryTransactionExecutor,
    );

    const subscriptions = await Subscriptions.create(
      transactionHandler,
      repositories.contractEntityRepository,
      fetchQueries,
      manifest.metachain.originChain.graphWsEndpoint,
      manifest.metachain.originChain.graphRpcEndpoint,
      subscriptionQueries.origin,
      manifest.metachain.auxiliaryChain.graphWsEndpoint,
      manifest.metachain.auxiliaryChain.graphRpcEndpoint,
      subscriptionQueries.auxiliary,
    );

    const facilitator = new Facilitator(
      originTransactionExecutor,
      auxiliaryTransactionExecutor,
      subscriptions.originSubscriber,
      subscriptions.auxiliarySubscriber,
    );

    return {
      facilitator,
      repositories,
    };
  }
}
