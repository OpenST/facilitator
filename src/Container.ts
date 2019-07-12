import Facilitator from './Facilitator';
import FacilitatorStart from './OptionParser/FacilitatorStart';
import { Config } from './Config';
import Repositories from './repositories/Repositories';
import Services from './services/Services';
import Subscriptions from './subscriptions/Subscriptions';
import TransactionHandler from './TransactionHandler';
import Handlers from './handlers/HandlerFactory';

export default class Container {
  private config: Config;


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
      auxChainId ? Number.parseInt(auxChainId, 10) : undefined,
      mosaicConfigPath,
      facilitatorConfigPath,
    );
    this.config = facilitatorStart.getConfig();
  }

  public async construct(): Promise<Facilitator> {
    const repositories = await Repositories.create();
    const transactionHandler = new TransactionHandler(
      Handlers.create(repositories, this.config.facilitator.auxChainId),

    );
    const subscriptions = await Subscriptions.create(
      transactionHandler,
      repositories,
    );

    return new Facilitator(subscriptions.originSubscriber, subscriptions.auxiliarySubscriber);
  }
}
