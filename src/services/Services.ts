import Repositories from '../repositories/Repositories';
import AcceptStakeRequestService from './AcceptStakeRequestService';
import ProveGatewayService from './ProveGatewayService';
import { Config } from '../Config/Config';

/**
 * This class is container that holds instances of all the services.
 */
export default class Services {
  public readonly acceptStakeRequestService: AcceptStakeRequestService;

  public readonly proveGatewayService: ProveGatewayService;

  /**
   * @param acceptStakeRequestService Instance of accept stake request service.
   * @param proveGatewayService Instance of prove gateway service.
   */
  private constructor(
    acceptStakeRequestService: AcceptStakeRequestService,
    proveGatewayService: ProveGatewayService,
  ) {
    this.acceptStakeRequestService = acceptStakeRequestService;
    this.proveGatewayService = proveGatewayService;
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
    return new Services(acceptStakeRequestService, proveGatewayService);
  }
}
