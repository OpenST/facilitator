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


export default class Handlers {
  /* Special Functions */

  /**
   * create() function instantiates all transaction handlers.
   *
   * @param repos Repository container object.
   * @param facilitateTokens Array of tokens to be facilitated.
   *
   * @return All supported kinds of transaction handlers mapped to entities.
   */
  public static create(
    repos: Repositories,
    facilitateTokens: Set<string>,
  ): Record<string, ContractEntityHandler> {
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
      facilitateTokens,
    );

    const declaredWithdrawIntentsHandler = new DeclaredWithdrawIntentsHandler(
      repos.withdrawIntentRepository,
      repos.messageRepository,
      repos.gatewayRepository,
      repos.erc20GatewayTokenPairRepository,
      facilitateTokens,
    );

    const gatewayProvenHandler = new GatewayProvenHandler(
      repos.gatewayRepository,
    );

    return {
      availableStateRoots: availableStateRootsHandler,
      confirmedDepositIntents: confirmDepositIntentsHandler,
      confirmedWithdrawIntents: confirmWithdrawIntentsHandler,
      createdUtilityTokens: createdUtilityTokenHandler,
      declaredDepositIntents: declaredDepositIntentsHandler,
      declaredWithdrawIntents: declaredWithdrawIntentsHandler,
      provenGateways: gatewayProvenHandler,
    };
  }
}
