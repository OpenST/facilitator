
import BigNumber from 'bignumber.js';
import StakeRequest from '../../src/models/StakeRequest';
import AuxiliaryChain from '../../src/models/AuxiliaryChain';

export default class StubData {
  public static getAStakeRequest = (stakeRequestHash: string): StakeRequest => new StakeRequest(
    stakeRequestHash,
    new BigNumber('1'),
    'beneficiary',
    new BigNumber('2'),
    new BigNumber('3'),
    new BigNumber('4'),
    'gateway',
    'stakerProxy',
  );

  public static getAuxiliaryChainRecord = (
    anchorAddress: string = '0x0000000000000000000000000000000000000003',
    lastOriginBlockHeight: BigNumber = new BigNumber('214748364475'),
  ): AuxiliaryChain => new AuxiliaryChain(
    10001,
    '10001',
    '0x0000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000002',
    anchorAddress,
    '0x0000000000000000000000000000000000000004',
    new BigNumber('214748364475'),
    lastOriginBlockHeight,
    new BigNumber('2000'),
    new Date(10),
    new Date(10),
  )
}
