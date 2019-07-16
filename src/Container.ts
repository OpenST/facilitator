import ConfigFactory from './Config/ConfigFactory';
import Facilitator from './Facilitator';
import Handlers from './handlers/Handlers';
import Repositories from './repositories/Repositories';
import Services from './services/Services';
import Subscriptions from './subscriptions/Subscriptions';
import TransactionHandler from './TransactionHandler';

export default class Container {
  /**
   * This instantiate all the dependencies.
   * @param originChain Origin chain Identifier
   * @param auxChainId Auxiliary chain ID.
   * @param mosaicConfigPath Mosaic Config path.
   * @param facilitatorConfigPath Facilitator config path.
   * @return Promise that resolves to facilitator instance.
   */
  public static async create(
    originChain?: string,
    auxChainId?: string,
    mosaicConfigPath?: string,
    facilitatorConfigPath?: string,
  ): Promise<Facilitator> {
    const configFactory: ConfigFactory = new ConfigFactory(
      originChain,
      auxChainId ? Number.parseInt(auxChainId, 10) : undefined,
      mosaicConfigPath,
      facilitatorConfigPath,
    );
    const config = configFactory.getConfig();

    const repositories = await Repositories.create(config.facilitator.database.path);
    const transactionHandler = new TransactionHandler(
      Handlers.create(repositories, config.facilitator.auxChainId),
      repositories,
    );
    const subscriptions = await Subscriptions.create(
      transactionHandler,
      repositories,
    );

    const services = Services.create(repositories, config);

    repositories.attach(services);

    return new Facilitator(subscriptions.originSubscriber, subscriptions.auxiliarySubscriber);
  }
}
