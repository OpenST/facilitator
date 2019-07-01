
import BigNumber from 'bignumber.js';
import StakeRequest from '../../src/models/StakeRequest';

export default class StubData {
  public static getAStakeRequest = (stakeRequestHash: string): StakeRequest => ({
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
