import BigNumber from 'bignumber.js';
import ContractEntityHandler from './ContractEntityHandler';
import {
  StakeRequestAttributes,
  StakeRequestRepository,
} from '../models/StakeRequestRepository';

import Logger from '../Logger';

/**
 * This class handels stake request transactions.
 */
export default class StakeRequestedHandler extends ContractEntityHandler<StakeRequestAttributes> {
  private readonly stakeRequestRepository: StakeRequestRepository;

  /**
   * Constructor
   *
   * @param stakeRequestRepository Instance of stake request repository.
   */
  public constructor(stakeRequestRepository: StakeRequestRepository) {
    super();
    this.stakeRequestRepository = stakeRequestRepository;
    this.persist = this.persist.bind(this);
  }

  /**
   * This method parse stakeRequest transaction and returns stakeRequest model object.
   *
   * @param transactions Transaction objects.
   *
   * @return Array of instances of StakeRequestAttributes object.
   */
  public persist =
  async (transactions: any[]): Promise<StakeRequestAttributes[]> => {
    const models = transactions.map((transaction) => {
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
    this.stakeRequestRepository.bulkCreate(models);
    return models;
  };

  /**
   * This method defines action on receiving stake request model.
   *
   * @param stakeRequest array of instances of StakeRequestAttributes object.
   */
  public handle = async (stakeRequest: StakeRequestAttributes[]): Promise<void> => {
    Logger.info(`Stake requests  : ${stakeRequest}`);
    return Promise.resolve();
    // stakeRequestService.reactTo(stakeRequest);
  };
}
