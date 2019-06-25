import StakeRequestedHandler from './StakeRequestedHandler';
import Database from '../models/Database';

export default class HandlerFactory {
  public static get(db: Database): {stakeRequesteds: StakeRequestedHandler} {
    return {
      stakeRequesteds: new StakeRequestedHandler(
        db.stakeRequestRepository,
      ),
    };
  }
}
