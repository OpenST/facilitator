import StakeRequestedHandler from './StakeRequestedHandler';
import Database from '../models/Database';

export default class HandlerFactory {
  /**
   * This methods instantiate different kinds of handlers. This method also takes
   * responsibility of instantiating repositories and services.
   *
   * @param db Database connection.
   * @return Different kinds of transaction handlers.
   */
  public static get(db: Database): {stakeRequesteds: StakeRequestedHandler} {
    return {
      stakeRequesteds: new StakeRequestedHandler(
        db.stakeRequestRepository,
      ),
    };
  }
}
