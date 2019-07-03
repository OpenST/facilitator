
import BigNumber from 'bignumber.js';
import { StakeRequestAttributes } from '../../src/models/StakeRequestRepository';
import { AuxiliaryChain } from '../../src/models/AuxiliaryChainRepository';

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
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}
