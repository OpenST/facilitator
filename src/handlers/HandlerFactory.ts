import StakeRequestedHandler from './StakeRequestedHandler';
import Repositories from '../repositories/Repositories';
import AnchorHandler from './AnchorHandler';

export default class HandlerFactory {
  /**
   * This methods instantiate different kinds of handlers. This method also takes
   * responsibility of instantiating repositories and services.
   *
   * @return Different kinds of transaction handlers.
   */
  public static get(repos: Repositories): { stakeRequesteds: StakeRequestedHandler; anchor: AnchorHandler } {
    return {
      stakeRequesteds: new StakeRequestedHandler(
        repos.stakeRequestRepository,
      ),
      anchor: new AnchorHandler(
        repos.auxiliaryChainRepository,
        1243, // fixme #87 replace with auxiliary chain id
      ),
    };
  }
}
