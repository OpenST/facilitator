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

import Manifest from '../manifest/Manifest';
import Repositories from '../repositories/Repositories';
import TransactionExecutor from '../lib/TransactionExecutor';

import ConfirmDepositService from './ConfirmDepositService';
import ConfirmWithdrawService from './ConfirmWithdrawService';
import ProveGatewayService from './ProveGatewayService';

export interface ServicesInterface {
  confirmDepositService: ConfirmDepositService;
  confirmWithdrawService: ConfirmWithdrawService;
  proveGatewayService: ProveGatewayService;
}

/** Creates M1 facilitator services and attach them to corresponding repositories. */
export default class Services implements ServicesInterface {
  /* Storage */

  public readonly confirmDepositService: ConfirmDepositService;

  public readonly confirmWithdrawService: ConfirmWithdrawService;

  public readonly proveGatewayService: ProveGatewayService;


  /* Public Functions */

  public static create(
    manifest: Manifest,
    repos: Repositories,
    originTransactionExecutor: TransactionExecutor,
    auxiliaryTransactionExecutor: TransactionExecutor,
  ): Services {
    const confirmDepositService = new ConfirmDepositService(
      manifest.metachain.originChain.web3,
      manifest.metachain.auxiliaryChain.web3,
      repos.messageRepository,
      repos.depositIntentRepository,
      auxiliaryTransactionExecutor,
    );
    repos.gatewayRepository.attach(confirmDepositService);

    const confirmWithdrawService = new ConfirmWithdrawService(
      manifest.metachain.originChain.web3,
      manifest.metachain.auxiliaryChain.web3,
      repos.messageRepository,
      repos.withdrawIntentRepository,
      originTransactionExecutor,
    );
    repos.gatewayRepository.attach(confirmWithdrawService);

    const proveGatewayService = new ProveGatewayService(
      repos.gatewayRepository,
      repos.messageRepository,
      manifest.metachain.originChain.web3,
      manifest.metachain.auxiliaryChain.web3,
      originTransactionExecutor,
      auxiliaryTransactionExecutor,
    );
    repos.anchorRepository.attach(proveGatewayService);

    return new Services(
      confirmDepositService,
      confirmWithdrawService,
      proveGatewayService,
    );
  }


  /* Private Functions */

  private constructor(
    confirmDepositService: ConfirmDepositService,
    confirmWithdrawService: ConfirmWithdrawService,
    proveGatewayService: ProveGatewayService,
  ) {
    this.confirmDepositService = confirmDepositService;
    this.confirmWithdrawService = confirmWithdrawService;
    this.proveGatewayService = proveGatewayService;
  }
}
