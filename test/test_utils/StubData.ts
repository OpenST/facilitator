import BigNumber from 'bignumber.js';

import AuxiliaryChain from '../../src/models/AuxiliaryChain';
import ContractEntity, { EntityType } from '../../src/models/ContractEntity';
import Gateway from '../../src/models/Gateway';
import Message from '../../src/models/Message';
import StakeRequest from '../../src/models/StakeRequest';
import { GatewayType } from '../../src/repositories/GatewayRepository';
import {
  MessageDirection, MessageStatus, MessageType,
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
    lastOriginBlockHeight?: BigNumber,
  ): AuxiliaryChain {
    return new AuxiliaryChain(
      chainId,
      '10003',
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000003',
      '0x0000000000000000000000000000000000000004',
      lastOriginBlockHeight,
      undefined,
      new Date(),
      new Date(),

    );
  }

  public static gatewayRecord(
    chain = '1234',
    gatewayAddress = '0x0000000000000000000000000000000000000001',
  ): Gateway {
    return new Gateway(gatewayAddress,
      chain,
      GatewayType.Origin,
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000003',
      new BigNumber('1'),
      true,
      new BigNumber('1'),
      new Date(),
      new Date());
  }

  public static messageAttributes(
    messageHash = '0x000000000000000000000000000000000000000000000000000001',
    gatewayAddress = '0x0000000000000000000000000000000000000001',
    sourceDeclarationBlockHeight = new BigNumber(1),
  ): Message {
    return new Message(
      messageHash,
      MessageType.Stake,
      gatewayAddress,
      MessageStatus.Declared,
      MessageStatus.Undeclared,
      new BigNumber('1'),
      new BigNumber('1'),
      new BigNumber('1'),
      '0x0000000000000000000000000000000000000002',
      MessageDirection.OriginToAuxiliary,
      sourceDeclarationBlockHeight,
    );
  }

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
    lastOriginBlockHeight,
    new BigNumber('2000'),
    new Date(10),
    new Date(10),
  )

  public static getContractEntity = (
    timestamp = new BigNumber(1),
  ): ContractEntity => new ContractEntity(
    '0x0000000000000000000000000000000000000002',
    EntityType.StakeProgresseds,
    timestamp,
    new Date(),
  );
}
