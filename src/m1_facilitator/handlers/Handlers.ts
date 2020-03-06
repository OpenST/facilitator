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

import ContractEntityHandler from '../../common/handlers/ContractEntityHandler';

import Repositories from '../repositories/Repositories';

import AvailableStateRootsHandler from './AvailableStateRootsHandler';
import ConfirmDepositIntentsHandler from './ConfirmDepositIntentsHandler';
import ConfirmWithdrawIntentsHandler from './ConfirmWithdrawIntentsHandler';
import CreatedUtilityTokenHandler from './CreatedUtilityTokenHandler';
import DeclaredDepositIntentsHandler from './DeclaredDepositIntentsHandler';
import DeclaredWithdrawIntentsHandler from './DeclaredWithdrawIntentsHandler';
import GatewayProvenHandler from './GatewayProvenHandler';


export default class Handlers implements Record<string, ContractEntityHandler> {
  /* Storage */

  [index: string]: ContractEntityHandler;

  public readonly availableStateRoots: AvailableStateRootsHandler;

  public readonly confirmedDepositIntents: ConfirmDepositIntentsHandler;

  public readonly confirmedWithdrawIntents: ConfirmWithdrawIntentsHandler;

  public readonly createdUtilityTokens: CreatedUtilityTokenHandler;

  public readonly declaredDepositIntents: DeclaredDepositIntentsHandler;

  public readonly declaredWithdrawIntents: DeclaredWithdrawIntentsHandler;

  public readonly provenGateways: GatewayProvenHandler;


  /* Special Functions */

  /**
   * create() function instantiates all transaction handlers.
   *
   * @param repos Repository container object.
   *
   * @return All supported kinds of transaction handlers.
   */
  public static create(repos: Repositories): Handlers {
    const availableStateRootsHandler = new AvailableStateRootsHandler(
      repos.anchorRepository,
    );

    const confirmDepositIntentsHandler = new ConfirmDepositIntentsHandler(
      repos.messageRepository,
      repos.gatewayRepository,
    );

    const confirmWithdrawIntentsHandler = new ConfirmWithdrawIntentsHandler(
      repos.messageRepository,
      repos.gatewayRepository,
    );

    const createdUtilityTokenHandler = new CreatedUtilityTokenHandler(
      repos.erc20GatewayTokenPairRepository,
      repos.gatewayRepository,
    );

    const declaredDepositIntentsHandler = new DeclaredDepositIntentsHandler(
      repos.depositIntentRepository,
      repos.gatewayRepository,
      repos.messageRepository,
    );

    const declaredWithdrawIntentsHandler = new DeclaredWithdrawIntentsHandler(
      repos.withdrawIntentRepository,
      repos.messageRepository,
      repos.gatewayRepository,
    );

    const gatewayProvenHandler = new GatewayProvenHandler(
      repos.gatewayRepository,
    );

    return new Handlers(
      availableStateRootsHandler,
      confirmDepositIntentsHandler,
      confirmWithdrawIntentsHandler,
      createdUtilityTokenHandler,
      declaredDepositIntentsHandler,
      declaredWithdrawIntentsHandler,
      gatewayProvenHandler,
    );
  }


  /* Private Functions */

  private constructor(
    availableStateRootsHandler: AvailableStateRootsHandler,
    confirmDepositIntentsHandler: ConfirmDepositIntentsHandler,
    confirmWithdrawIntentsHandler: ConfirmWithdrawIntentsHandler,
    createdUtilityTokenHandler: CreatedUtilityTokenHandler,
    declaredDepositIntentsHandler: DeclaredDepositIntentsHandler,
    declaredWithdrawIntentsHandler: DeclaredWithdrawIntentsHandler,
    gatewayProvenHandler: GatewayProvenHandler,
  ) {
    this.availableStateRoots = availableStateRootsHandler;
    this.confirmedDepositIntents = confirmDepositIntentsHandler;
    this.confirmedWithdrawIntents = confirmWithdrawIntentsHandler;
    this.createdUtilityTokens = createdUtilityTokenHandler;
    this.declaredDepositIntents = declaredDepositIntentsHandler;
    this.declaredWithdrawIntents = declaredWithdrawIntentsHandler;
    this.provenGateways = gatewayProvenHandler;
  }
}
