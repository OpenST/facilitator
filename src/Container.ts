import Facilitator from './Facilitator';
import FacilitatorStart from './OptionParser/FacilitatorStart';
import { Config } from './Config';
import Repositories from './repositories/Repositories';
import Services from './services/Services';
import Subscriptions from './subscriptions/Subscriptions';

export default class Container {
  private config: Config;

  private repositories: Repositories;

  private services: Services;

  private subscriptions: Subscriptions;

  /**
   *
   * @param originChain Origin chain Identifier
   * @param auxChainId Auxiliary chain ID.
   * @param mosaicConfigPath Mosaic Config path.
   * @param facilitatorConfigPath Facilitator config path.
   */
  constructor(
    originChain?: string,
    auxChainId?: string,
    mosaicConfigPath?: string,
    facilitatorConfigPath?: string,
  ) {
    const facilitatorStart: FacilitatorStart = new FacilitatorStart(
      originChain,
      auxChainId,
      mosaicConfigPath,
      facilitatorConfigPath,
    );
    this.config = facilitatorStart.getConfig();
  }

  public construct(): Facilitator {
    return new Facilitator(this.config);
  }
}
