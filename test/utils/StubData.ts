import { AuxiliaryChain } from '../../src/models/AuxiliaryChainRepository';

export default class StubData {
  public static auxiliaryChainRecord(): AuxiliaryChain {
    return {
      lastAuxiliaryBlockHeight: undefined,
      lastOriginBlockHeight: undefined,
      lastProcessedBlockNumber: undefined,
      chainId: 10002,
      originChainName: '10003',
      ostGatewayAddress: '0x0000000000000000000000000000000000000001',
      ostCoGatewayAddress: '0x0000000000000000000000000000000000000002',
      anchorAddress: '0x0000000000000000000000000000000000000003',
      coAnchorAddress: '0x0000000000000000000000000000000000000004',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
