
import BigNumber from 'bignumber.js';
import { StakeRequestAttributes } from '../../src/models/StakeRequestRepository';

export default class StubData {
  public static getAStakeRequest = (stakeRequestHash: string): StakeRequestAttributes => ({
    stakeRequestHash,
    amount: new BigNumber('1'),
    beneficiary: 'beneficiary',
    gasPrice: new BigNumber('2'),
    gasLimit: new BigNumber('3'),
    nonce: new BigNumber('4'),
    gateway: 'gateway',
    stakerProxy: 'stakerProxy',
  });
}
