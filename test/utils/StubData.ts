import BigNumber from 'bignumber.js';
import { AuxiliaryChain } from '../../src/models/AuxiliaryChainRepository';
import {
  Gateway,
  GatewayAttributes,
  GatewayType,
} from '../../src/models/GatewayRepository';
import {
  MessageAttributes, MessageDirection, MessageStatus,
  MessageType,
} from '../../src/models/MessageRepository';

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

  public static gatewayAttributes(chainId = '1234', gatewayAddress = '0x0000000000000000000000000000000000000001'): GatewayAttributes {
    return {
      gatewayAddress,
      chainId,
      gatewayType: GatewayType.Origin,
      remoteGatewayAddress: '0x0000000000000000000000000000000000000002',
      anchorAddress: '0x0000000000000000000000000000000000000003',
      tokenAddress: '0x0000000000000000000000000000000000000004',
      bounty: new BigNumber('1'),
      activation: true,
    };
  }

  public static gatewayRecord(
    chainId = '1234',
    gatewayAddress = '0x0000000000000000000000000000000000000001',
  ): Gateway {
    return {
      gatewayAddress,
      chainId,
      gatewayType: GatewayType.Origin,
      remoteGatewayAddress: '0x0000000000000000000000000000000000000002',
      anchorAddress: '0x0000000000000000000000000000000000000003',
      tokenAddress: '0x0000000000000000000000000000000000000004',
      bounty: new BigNumber('1'),
      activation: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public static messageAttributes(
    messageHash = '0x000000000000000000000000000000000000000000000000000001',
    gatewayAddress = '0x0000000000000000000000000000000000000001',
    sourceDeclarationBlockHeight = new BigNumber(1),
  ): MessageAttributes {
    return {
      messageHash,
      type: MessageType.Stake,
      gatewayAddress,
      sourceStatus: MessageStatus.Declared,
      targetStatus: MessageStatus.Undeclared,
      gasPrice: new BigNumber('1'),
      gasLimit: new BigNumber('1'),
      nonce: new BigNumber('1'),
      sender: '0x0000000000000000000000000000000000000002',
      direction: MessageDirection.OriginToAuxiliary,
      sourceDeclarationBlockHeight,
    };
  }
}
