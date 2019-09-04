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
import AnchorHandler from './stake_and_mint/AnchorHandler';
import MintProgressHandler from './stake_and_mint/MintProgressHandler';
import ProveGatewayHandler from './stake_and_mint/ProveGatewayHandler';
import StakeIntentDeclaredHandler from './stake_and_mint/StakeIntentDeclaredHandler';
import StakeProgressHandler from './stake_and_mint/StakeProgressHandler';
import StakeRequestHandler from './stake_and_mint/StakeRequestHandler';
import StakeIntentConfirmHandler from './stake_and_mint/StakeIntentConfirmHandler';
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
      stakeRequesteds: StakeRequestHandler;
      stateRootAvailables: AnchorHandler;
      stakeIntentDeclareds: StakeIntentDeclaredHandler;
      gatewayProvens: ProveGatewayHandler;
      stakeProgresseds: StakeProgressHandler;
      mintProgresseds: MintProgressHandler;
      stakeIntentConfirmeds: StakeIntentConfirmHandler;
      redeemIntentDeclareds: RedeemIntentDeclaredHandler;
    } {
    return {
      // Stake and Mint Handlers
      stakeRequesteds: new StakeRequestHandler(
        repos.stakeRequestRepository,
        gatewayAddress,
      ),
      stateRootAvailables: new AnchorHandler(
        repos.auxiliaryChainRepository,
        auxChainId,
      ),
      stakeIntentDeclareds: new StakeIntentDeclaredHandler(repos.messageRepository),
      gatewayProvens: new ProveGatewayHandler(
        repos.gatewayRepository,
      ),
      stakeIntentConfirmeds: new StakeIntentConfirmHandler(repos.messageRepository),
      stakeProgresseds: new StakeProgressHandler(repos.messageRepository),
      mintProgresseds: new MintProgressHandler(repos.messageRepository),

      // Redeem and Unstake Handlers
      redeemIntentDeclareds: new RedeemIntentDeclaredHandler(repos.messageRepository),
    };
  }
}
