import StakeRequestedHandler from './StakeRequestedHandler';
import Database from '../models/Database';
import { Factory as ServiceFactory } from '../services/Factory';
import { Config } from '../Config';

export default class HandlerFactory {
  /**
   * This methods instantiate different kinds of handlers. This method also takes
   * responsibility of instantiating repositories and services.
   *
   * @param db Database connection.
   * @return Different kinds of transaction handlers.
   */
  public static get(db: Database, config: Config): {stakeRequesteds: StakeRequestedHandler} {
    const serviceFactory = new ServiceFactory(db, config);

    const { stakeRequestService } = serviceFactory;
    return {
      stakeRequesteds: new StakeRequestedHandler(
        db.stakeRequestRepository,
        stakeRequestService,
      ),
    };
  }
}
