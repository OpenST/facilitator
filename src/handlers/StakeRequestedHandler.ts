import BigNumber from 'bignumber.js';
import ContractEntityHandler from './ContractEntityHandler';
import {
  StakeRequestAttributes,
  StakeRequestRepository,
} from '../models/StakeRequestRepository';

export default class StakeRequestedHandler extends ContractEntityHandler<StakeRequestAttributes> {
  private readonly stakeRequestRepository: StakeRequestRepository;

  public constructor(stakeRequestRepository: StakeRequestRepository) {
    super();
    this.stakeRequestRepository = stakeRequestRepository;
  }

  /**
   * This method parse stakeRequest transaction and returns stakeRequest model object.
   * @param transactions Transaction objects.
   */
  public parse =
  (transactions: any[]): StakeRequestAttributes[] => transactions.map((transaction) => {
    const {
      gasLimit,
      gateway,
      gasPrice,
      nonce,
      beneficiary,
      amount,
      stakeRequestHash,
      stakerProxy,
    } = transaction;
    return {
      stakeRequestHash,
      amount: new BigNumber(amount),
      beneficiary,
      gasPrice: new BigNumber(gasPrice),
      gasLimit: new BigNumber(gasLimit),
      nonce: new BigNumber(nonce),
      gateway,
      stakerProxy,
    };
  });

  /**
   * This method defines action on receiving stake request model.
   * @param stakeRequest instance of StakeRequest model .
   */
  public handle = (stakeRequest: StakeRequestAttributes[]): void => {
    this.stakeRequestRepository.bulkCreate(stakeRequest);
    // stakeRequestService.reactTo(stakeRequest);
  };
}
