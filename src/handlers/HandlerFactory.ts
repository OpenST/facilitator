import StakeRequestedHandler from './StakeRequestedHandler';
import Repositories from '../repositories/Repositories';

export default class HandlerFactory {
  /**
   * This methods instantiate different kinds of handlers. This method also takes
   * responsibility of instantiating repositories and services.
   *
   * @return Different kinds of transaction handlers.
   */
  public static get(repos: Repositories): {stakeRequesteds: StakeRequestedHandler} {
    return {
      stakeRequesteds: new StakeRequestedHandler(
        repos.stakeRequestRepository,
      ),
    };
  }
}
