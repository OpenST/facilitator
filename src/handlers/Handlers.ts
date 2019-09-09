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

import Repositories from '../repositories/Repositories';
import StateRootAvailableHandler from './stake_and_mint/StateRootAvailableHandler';
import MintProgressedHandler from './stake_and_mint/MintProgressedHandler';
import GatewayProvenHandler from './stake_and_mint/GatewayProvenHandler';
import StakeIntentDeclaredHandler from './stake_and_mint/StakeIntentDeclaredHandler';
import StakeProgressedHandler from './stake_and_mint/StakeProgressedHandler';
import StakeRequestedHandler from './stake_and_mint/StakeRequestedHandler';
import StakeIntentConfirmedHandler from './stake_and_mint/StakeIntentConfirmedHandler';
import RedeemIntentDeclaredHandler from './redeem_and_unstake/RedeemIntentDeclaredHandler';

export default class Handlers {
  /**
   * This methods instantiate different kinds of handlers. This method also takes
   * responsibility of instantiating repositories and services.
   *
   * @param repos Repository container.
   * @param auxChainId ID of auxiliary chain.
   * @param gatewayAddress Origin chain gateway address.
   * @return Different kinds of transaction handlers.
   */
  public static create(
    repos: Repositories,
    auxChainId: number,
    gatewayAddress: string,
  ): {
      stakeRequesteds: StakeRequestedHandler;
      stateRootAvailables: StateRootAvailableHandler;
      stakeIntentDeclareds: StakeIntentDeclaredHandler;
      gatewayProvens: GatewayProvenHandler;
      stakeProgresseds: StakeProgressedHandler;
      mintProgresseds: MintProgressedHandler;
      stakeIntentConfirmeds: StakeIntentConfirmedHandler;
      redeemIntentDeclareds: RedeemIntentDeclaredHandler;
    } {
    return {
      // Stake and Mint Handlers
      stakeRequesteds: new StakeRequestedHandler(
        repos.stakeRequestRepository,
        gatewayAddress,
      ),
      stateRootAvailables: new StateRootAvailableHandler(
        repos.auxiliaryChainRepository,
        auxChainId,
      ),
      stakeIntentDeclareds: new StakeIntentDeclaredHandler(repos.messageRepository),
      gatewayProvens: new GatewayProvenHandler(
        repos.gatewayRepository,
      ),
      stakeIntentConfirmeds: new StakeIntentConfirmedHandler(repos.messageRepository),
      stakeProgresseds: new StakeProgressedHandler(repos.messageRepository),
      mintProgresseds: new MintProgressedHandler(repos.messageRepository),

      // Redeem and Unstake Handlers
      redeemIntentDeclareds: new RedeemIntentDeclaredHandler(repos.messageRepository),
    };
  }
}
