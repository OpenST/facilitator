// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------


import BigNumber from 'bignumber.js';
import * as utils from 'web3-utils';

import AuxiliaryChain from '../../src/m0_facilitator/models/AuxiliaryChain';
import ContractEntity, { EntityType } from '../../src/common/models/ContractEntity';
import Gateway from '../../src/m0_facilitator/models/Gateway';
import Message from '../../src/m0_facilitator/models/Message';
import MessageTransferRequest from '../../src/m0_facilitator/models/MessageTransferRequest';
import { GatewayType } from '../../src/m0_facilitator/repositories/GatewayRepository';
import {
  MessageDirection, MessageStatus, MessageType,
} from '../../src/m0_facilitator/repositories/MessageRepository';
import { RequestType } from '../../src/m0_facilitator/repositories/MessageTransferRequestRepository';

export default class StubData {
  public static getAMessageTransferRequest = (
    requestHash: string,
    requestType = RequestType.Stake,
  ): MessageTransferRequest => new MessageTransferRequest(
    requestHash,
    requestType,
    new BigNumber('10'),
    new BigNumber('1'),
    '0x0000000000000000000000000000000000000001',
    new BigNumber('2'),
    new BigNumber('3'),
    new BigNumber('4'),
    '0x0000000000000000000000000000000000000002',
    '0x0000000000000000000000000000000000000003',
    '0x0000000000000000000000000000000000000004',
    null,
  );

  public static auxiliaryChainRecord(
    chainId = 10002,
    lastOriginBlockHeight?: BigNumber,
    lastAuxiliaryBlockHeight?: BigNumber,
  ): AuxiliaryChain {
    return new AuxiliaryChain(
      chainId,
      '10003',
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000003',
      '0x0000000000000000000000000000000000000004',
      lastOriginBlockHeight,
      lastAuxiliaryBlockHeight,
      new Date(),
      new Date(),

    );
  }

  public static gatewayRecord(
    chain = '1234',
    gatewayAddress = '0x0000000000000000000000000000000000000001',
    gatewayType = GatewayType.Origin,
  ): Gateway {
    return new Gateway(gatewayAddress,
      chain,
      gatewayType,
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000003',
      new BigNumber('1'),
      new BigNumber('5'),
      true,
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
      MessageDirection.OriginToAuxiliary,
      utils.toChecksumAddress(gatewayAddress),
      MessageStatus.Declared,
      MessageStatus.Undeclared,
      new BigNumber('1'),
      new BigNumber('1'),
      new BigNumber('1'),
      utils.toChecksumAddress('0x0000000000000000000000000000000000000002'),
      sourceDeclarationBlockHeight,
    );
  }

  public static getAuxiliaryChainRecord = (
    coAnchorAddress: string = '0x0000000000000000000000000000000000000003',
    lastOriginBlockHeight: BigNumber = new BigNumber('214748364475'),
  ): AuxiliaryChain => new AuxiliaryChain(
    10001,
    '10001',
    '0x0000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000002',
    '0x0000000000000000000000000000000000000004',
    coAnchorAddress,
    lastOriginBlockHeight,
    new BigNumber('2000'),
    new Date(10),
    new Date(10),
  );

  public static getContractEntity = (
    timestamp = new BigNumber(1),
  ): ContractEntity => new ContractEntity(
    '0x0000000000000000000000000000000000000002',
    EntityType.StakeProgresseds,
    timestamp,
    new Date(),
  );
}
