import { Config } from '../Config/Config';
import Repositories from '../repositories/Repositories';
import AcceptStakeRequestService from './stake_and_mint/AcceptStakeRequestService';
import ProveGatewayService from './stake_and_mint/ProveGatewayService';
import ConfirmStakeIntentService from './stake_and_mint/ConfirmStakeIntentService';
import StakeProgressService from './stake_and_mint/ProgressService';
import RedeemProgressService from './redeem_and_unstake/ProgressService';
import Utils from '../Utils';
import ProveCoGatewayService from './redeem_and_unstake/ProveCoGatewayService';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * This class is container that holds instances of all the services.
 */
export default class Services {
  public readonly acceptStakeRequestService: AcceptStakeRequestService;

  public readonly proveGatewayService: ProveGatewayService;

  public readonly confirmStakeIntentService: ConfirmStakeIntentService;

  public readonly stakeProgressService: StakeProgressService;

  public readonly redeemProgressService: RedeemProgressService;

  public readonly proveCoGatewayService: ProveCoGatewayService;

  /**
   * @param acceptStakeRequestService Instance of accept stake request service.
   * @param proveGatewayService Instance of prove gateway service.
   * @param confirmStakeIntentService Instance of confirm stake intent service.
   * @param stakeProgressService Instance of stake progress service.
   * @param redeemProgressService Instance of redeem progress service.
   * @param proveCoGatewayService Instance of prove cogateway service.
   */
  private constructor(
    acceptStakeRequestService: AcceptStakeRequestService,
    proveGatewayService: ProveGatewayService,
    confirmStakeIntentService: ConfirmStakeIntentService,
    stakeProgressService: StakeProgressService,
    redeemProgressService: RedeemProgressService,
    proveCoGatewayService: ProveCoGatewayService,
  ) {
    this.acceptStakeRequestService = acceptStakeRequestService;
    this.proveGatewayService = proveGatewayService;
    this.confirmStakeIntentService = confirmStakeIntentService;
    this.stakeProgressService = stakeProgressService;
    this.redeemProgressService = redeemProgressService;
    this.proveCoGatewayService = proveCoGatewayService;
  }

  /**
   * This is a factory method to create Service container.
   * @param repositories Repository container.
   * @param config Instance of config.
   */
  public static create(repositories: Repositories, config: Config): Services {
    const acceptStakeRequestService = new AcceptStakeRequestService(
      repositories,
      config.originWeb3,
      Utils.toChecksumAddress(config.mosaic.originChain.contractAddresses.ostComposerAddress!),
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
        config.mosaic.auxiliaryChains[auxChainId].contractAddresses.origin.ostEIP20GatewayAddress!,
      ),
      auxChainId,
    );

    const proveCoGatewayService = new ProveCoGatewayService(
      repositories.gatewayRepository,
      repositories.messageRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      Utils.toChecksumAddress(config.facilitator.chains[config.facilitator.originChain].worker),
      // This parameter value represents interested CoGateway, for now it's OST prime CoGateway.
      Utils.toChecksumAddress(
        config.mosaic.auxiliaryChains[auxChainId].contractAddresses.auxiliary
          .ostEIP20CogatewayAddress!,
      ),
      auxChainId,
    );

    const confirmStakeIntentService = new ConfirmStakeIntentService(
      repositories.messageRepository,
      repositories.messageTransferRequestRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      config.mosaic.auxiliaryChains[auxChainId].contractAddresses.origin.ostEIP20GatewayAddress!,
      config.mosaic.auxiliaryChains[auxChainId]
        .contractAddresses.auxiliary.ostEIP20CogatewayAddress!,
      config.facilitator.chains[config.facilitator.auxChainId].worker,
    );

    const stakeProgressService = new StakeProgressService(
      repositories.gatewayRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      config.mosaic.auxiliaryChains[auxChainId].contractAddresses.origin.ostEIP20GatewayAddress!,
      config.facilitator.chains[config.facilitator.originChain].worker,
      config.facilitator.chains[config.facilitator.auxChainId].worker,
    );

    const redeemProgressService = new RedeemProgressService(
      repositories.gatewayRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      config.mosaic.auxiliaryChains[auxChainId].contractAddresses.auxiliary
        .ostEIP20CogatewayAddress!,
      config.facilitator.chains[config.facilitator.originChain].worker,
      config.facilitator.chains[config.facilitator.auxChainId].worker,
    );

    return new Services(
      acceptStakeRequestService,
      proveGatewayService,
      confirmStakeIntentService,
      stakeProgressService,
      redeemProgressService,
      proveCoGatewayService,
    );
  }
}
