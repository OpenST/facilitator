
import BigNumber from 'bignumber.js';
import StakeRequest from '../../src/models/StakeRequest';

import { AuxiliaryChain } from '../../src/repositories/AuxiliaryChainRepository';
import {
  Gateway,
  GatewayAttributes,
  GatewayType,
} from '../../src/repositories/GatewayRepository';
import {
  MessageAttributes, MessageDirection, MessageStatus,
  MessageType,
} from '../../src/repositories/MessageRepository';

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

  public static auxiliaryChainRecord(
    chainId = 10002,
    lastOriginBlockHeight = new BigNumber(100),
  ): AuxiliaryChain {
    return {
      lastAuxiliaryBlockHeight: undefined,
      lastOriginBlockHeight,
      lastProcessedBlockNumber: undefined,
      chainId,
      originChainName: '10003',
      ostGatewayAddress: '0x0000000000000000000000000000000000000001',
      ostCoGatewayAddress: '0x0000000000000000000000000000000000000002',
      anchorAddress: '0x0000000000000000000000000000000000000003',
      coAnchorAddress: '0x0000000000000000000000000000000000000004',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public static gatewayAttributes(chain = '1234', gatewayAddress = '0x0000000000000000000000000000000000000001'): GatewayAttributes {
    return {
      gatewayAddress,
      chain,
      gatewayType: GatewayType.Origin,
      remoteGatewayAddress: '0x0000000000000000000000000000000000000002',
      anchorAddress: '0x0000000000000000000000000000000000000003',
      tokenAddress: '0x0000000000000000000000000000000000000004',
      bounty: new BigNumber('1'),
      activation: true,
    };
  }

  public static gatewayRecord(
    chain = '1234',
    gatewayAddress = '0x0000000000000000000000000000000000000001',
  ): Gateway {
    return {
      gatewayAddress,
      chain,
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
