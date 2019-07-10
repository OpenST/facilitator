
import BigNumber from 'bignumber.js';
import StakeRequest from '../../src/models/StakeRequest';
import { AuxiliaryChain } from '../../src/repositories/AuxiliaryChainRepository';

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
  ): AuxiliaryChain => ({
    chainId: 10001,
    originChainName: '10001',
    ostGatewayAddress: '0x0000000000000000000000000000000000000001',
    ostCoGatewayAddress: '0x0000000000000000000000000000000000000002',
    anchorAddress,
    coAnchorAddress: '0x0000000000000000000000000000000000000004',
    lastAuxiliaryBlockHeight: new BigNumber('214748364475'),
    lastOriginBlockHeight,
    createdAt: new Date(10),
    updatedAt: new Date(10),
  })
}
