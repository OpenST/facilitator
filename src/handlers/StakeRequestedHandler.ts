import ContractEntityHandler from './ContractEntityHandler';
import StakeRequest from '../models/StakeRequest';

export default class StakeRequestedHandler implements ContractEntityHandler {

  /**
   * This method parse specific type of transaction and returns model object.
   * @param transaction Transaction object.
   */
  public parse = (transaction: any): StakeRequest => {
    const {
      gasLimit,
      gateway,
      staker,
      gasPrice,
      id,
      nonce,
      beneficiary,
      amount,
      stakeRequestHash,
    } = transaction;
    return new StakeRequest(
      id,
      amount,
      beneficiary,
      gasPrice,
      gasLimit,
      nonce,
      staker,
      gateway,
      stakeRequestHash,
    );
  };
  /**
   * This method defines action on receiving specific type of model.
   * @param stakeRequest instance of StakeRequestModel .
   */
  public handle = (stakeRequest: StakeRequest): void => {

    // stakeRequestRepository.save(stakeRequest);
    // stakeRequestService.reactTo(stakeRequest);
  };
}
