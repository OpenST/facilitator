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


import { Config } from '../Config/Config';
import Repositories from '../repositories/Repositories';
import AcceptStakeRequestService from './stake_and_mint/AcceptStakeRequestService';
import ProveGatewayService from './stake_and_mint/ProveGatewayService';
import ConfirmStakeIntentService from './stake_and_mint/ConfirmStakeIntentService';
import StakeProgressService from './stake_and_mint/ProgressService';
import RedeemProgressService from './redeem_and_unstake/ProgressService';
import Utils from '../Utils';
import ProveCoGatewayService from './redeem_and_unstake/ProveCoGatewayService';
import ConfirmRedeemIntentService from './redeem_and_unstake/ConfirmRedeemIntentService';
import AcceptRedeemRequestService from './redeem_and_unstake/AcceptRedeemRequestService';
import GatewayAddresses from '../Config/GatewayAddresses';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * This class is container that holds instances of all the services.
 */
export default class Services {
  // Stake & Mint services
  public readonly acceptStakeRequestService: AcceptStakeRequestService;

  public readonly proveGatewayService: ProveGatewayService;

  public readonly confirmStakeIntentService: ConfirmStakeIntentService;

  public readonly stakeProgressService: StakeProgressService;

  // Redeem & Unstake services
  public readonly acceptRedeemRequestService: AcceptRedeemRequestService;

  public readonly confirmRedeemIntentService: ConfirmRedeemIntentService;

  public readonly proveCoGatewayService: ProveCoGatewayService;

  public readonly redeemProgressService: RedeemProgressService;

  /**
   * @param acceptStakeRequestService Instance of accept stake request service.
   * @param proveGatewayService Instance of prove gateway service.
   * @param confirmStakeIntentService Instance of confirm stake intent service.
   * @param stakeProgressService Instance of stake progress service.
   * @param acceptRedeemRequestService Instance of accept redeem request service.
   * @param confirmRedeemIntentService Instance of confirm redeem intent service.
   * @param proveCoGatewayService Instance of prove cogateway service.
   * @param redeemProgressService Instance of redeem progress service.
   */
  private constructor(
    acceptStakeRequestService: AcceptStakeRequestService,
    proveGatewayService: ProveGatewayService,
    confirmStakeIntentService: ConfirmStakeIntentService,
    stakeProgressService: StakeProgressService,
    acceptRedeemRequestService: AcceptRedeemRequestService,
    proveCoGatewayService: ProveCoGatewayService,
    confirmRedeemIntentService: ConfirmRedeemIntentService,
    redeemProgressService: RedeemProgressService,
  ) {
    // Stake & Mint services
    this.acceptStakeRequestService = acceptStakeRequestService;
    this.proveGatewayService = proveGatewayService;
    this.confirmStakeIntentService = confirmStakeIntentService;
    this.stakeProgressService = stakeProgressService;

    // Redeem & Unstake services
    this.acceptRedeemRequestService = acceptRedeemRequestService;
    this.confirmRedeemIntentService = confirmRedeemIntentService;
    this.proveCoGatewayService = proveCoGatewayService;
    this.redeemProgressService = redeemProgressService;
  }

  /**
   * This is a factory method to create Service container.
   * @param repositories Repository container.
   * @param config Instance of config.
   * @param gatewayAddresses GatewayAddresses object.
   */
  public static create(repositories: Repositories, config: Config, gatewayAddresses: GatewayAddresses): Services {
    // Initialize stake & mint services

    const acceptStakeRequestService = new AcceptStakeRequestService(
      repositories,
      config.originWeb3,
      Utils.toChecksumAddress(gatewayAddresses.stakePoolAddress),
      Utils.toChecksumAddress(config.facilitator.chains[config.facilitator.originChain].worker),
    );
    const { auxChainId } = config.facilitator;
    const proveGatewayService = new ProveGatewayService(
      repositories.gatewayRepository,
      repositories.messageRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      Utils.toChecksumAddress(config.facilitator.chains[auxChainId].worker),
      // This parameter value represents interested gateway, for now it's OST prime gateway.
      Utils.toChecksumAddress(
        gatewayAddresses.originGatewayAddress,
      ),
      auxChainId,
    );

    const confirmStakeIntentService = new ConfirmStakeIntentService(
      repositories.messageRepository,
      repositories.messageTransferRequestRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      gatewayAddresses.originGatewayAddress,
      gatewayAddresses.auxiliaryGatewayAddress,
      config.facilitator.chains[config.facilitator.auxChainId].worker,
    );

    const stakeProgressService = new StakeProgressService(
      repositories.gatewayRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      gatewayAddresses.originGatewayAddress,
      config.facilitator.chains[config.facilitator.originChain].worker,
      config.facilitator.chains[config.facilitator.auxChainId].worker,
    );

    // Initialize Redeem & Unstake services

    const acceptRedeemRequestService = new AcceptRedeemRequestService(
      repositories,
      config.auxiliaryWeb3,
      Utils.toChecksumAddress(gatewayAddresses.redeemPoolAddress),
      Utils.toChecksumAddress(config.facilitator.chains[config.facilitator.auxChainId].worker),
    );

    const confirmRedeemIntentService = new ConfirmRedeemIntentService(
      repositories.messageRepository,
      repositories.messageTransferRequestRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      gatewayAddresses.originGatewayAddress,
      gatewayAddresses.auxiliaryGatewayAddress,
      config.facilitator.chains[config.facilitator.originChain].worker,
    );

    const proveCoGatewayService = new ProveCoGatewayService(
      repositories.gatewayRepository,
      repositories.messageRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      Utils.toChecksumAddress(config.facilitator.chains[config.facilitator.originChain].worker),
      // This parameter value represents interested CoGateway, for now it's OST prime CoGateway.
      Utils.toChecksumAddress(gatewayAddresses.auxiliaryGatewayAddress),
      auxChainId,
    );

    const redeemProgressService = new RedeemProgressService(
      repositories.gatewayRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      gatewayAddresses.auxiliaryGatewayAddress,
      config.facilitator.chains[config.facilitator.originChain].worker,
      config.facilitator.chains[config.facilitator.auxChainId].worker,
    );

    return new Services(
      acceptStakeRequestService,
      proveGatewayService,
      confirmStakeIntentService,
      stakeProgressService,
      acceptRedeemRequestService,
      proveCoGatewayService,
      confirmRedeemIntentService,
      redeemProgressService,
    );
  }
}
