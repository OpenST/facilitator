import Repositories from '../repositories/Repositories';
import AcceptStakeRequestService from './AcceptStakeRequestService';
import ProveGatewayService from './ProveGatewayService';
import { Config } from '../Config/Config';
import ConfirmStakeIntentService from "./ConfirmStakeIntentService";
import ProgressService from "./ProgressService";

/**
 * This class is container that holds instances of all the services.
 */
export default class Services {
  public readonly acceptStakeRequestService: AcceptStakeRequestService;

  public readonly proveGatewayService: ProveGatewayService;

  public readonly confirmStakeIntentService: ConfirmStakeIntentService;

  public readonly progressService: ProgressService;

  /**
   * @param acceptStakeRequestService Instance of accept stake request service.
   * @param proveGatewayService Instance of prove gateway service.
   * @param confirmStakeIntentService Instance of confirm stake intent service.
   * @param progressService Instance of progress service.
   */
  private constructor(
    acceptStakeRequestService: AcceptStakeRequestService,
    proveGatewayService: ProveGatewayService,
    confirmStakeIntentService: ConfirmStakeIntentService,
    progressService: ProgressService,
  ) {
    this.acceptStakeRequestService = acceptStakeRequestService;
    this.proveGatewayService = proveGatewayService;
    this.confirmStakeIntentService = confirmStakeIntentService;
    this.progressService = progressService;
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
      config.mosaic.originChain.contractAddresses.ostComposerAddress!,
      config.facilitator.chains[config.facilitator.originChain].worker,
    );

    const { auxChainId } = config.facilitator;
    const proveGatewayService = new ProveGatewayService(
      repositories.gatewayRepository,
      repositories.messageRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      config.facilitator.chains[auxChainId].worker,
      // This parameter value represents interested gateway, for now it's OST prime gateway.
      config.mosaic.auxiliaryChains[auxChainId].contractAddresses.origin.ostEIP20GatewayAddress!,
      auxChainId,
    );

    const confirmStakeIntentService = new ConfirmStakeIntentService(
      repositories.messageRepository,
      repositories.stakeRequestRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      config.mosaic.auxiliaryChains[auxChainId].contractAddresses.origin.ostEIP20GatewayAddress!,
      config.mosaic.auxiliaryChains[auxChainId].contractAddresses.auxiliary.ostEIP20CogatewayAddress!,
      config.facilitator.chains[config.facilitator.originChain].worker,
    );

    const progressService = new ProgressService(
      repositories.gatewayRepository,
      config.originWeb3,
      config.auxiliaryWeb3,
      config.mosaic.auxiliaryChains[auxChainId].contractAddresses.origin.ostEIP20GatewayAddress!,
      config.facilitator.chains[config.facilitator.originChain].worker,
      config.facilitator.chains[config.facilitator.auxChainId].worker,
    );

    return new Services(
      acceptStakeRequestService,
      proveGatewayService,
      confirmStakeIntentService,
      progressService
    );
  }
}
