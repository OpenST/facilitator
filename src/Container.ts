import ConfigFactory from './Config/ConfigFactory';
import Facilitator from './Facilitator';
import Handlers from './handlers/Handlers';
import Logger from './Logger';
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
    Logger.debug('Reading config file');
    const configFactory: ConfigFactory = new ConfigFactory(
      originChain,
      auxChainId ? Number.parseInt(auxChainId, 10) : undefined,
      mosaicConfigPath,
      facilitatorConfigPath,
    );
    const config = configFactory.getConfig();
    Logger.debug('Config loaded successfully.');
    const repositories = await Repositories.create(config.facilitator.database.path);
    const handler = Handlers.create(
      repositories,
      config.facilitator.auxChainId,
      config.mosaic.auxiliaryChains[config.facilitator.auxChainId].contractAddresses
        .origin.ostEIP20GatewayAddress!,
      config.mosaic.auxiliaryChains[config.facilitator.auxChainId].contractAddresses
        .auxiliary.ostEIP20CogatewayAddress!,
    );
    const transactionHandler = new TransactionHandler(
      handler,
      repositories,
    );
    const configOriginChain = config.facilitator.originChain;
    const configAuxChainId = config.facilitator.auxChainId;
    const subscriptions = await Subscriptions.create(
      transactionHandler,
      repositories,
      config.facilitator.chains[configOriginChain].subGraphWs,
      config.facilitator.chains[configOriginChain].subGraphRpc,
      config.facilitator.chains[configAuxChainId].subGraphWs,
      config.facilitator.chains[configAuxChainId].subGraphRpc,
    );

    const services = Services.create(repositories, config);

    repositories.attach(services);

    return new Facilitator(subscriptions.originSubscriber, subscriptions.auxiliarySubscriber);
  }
}
