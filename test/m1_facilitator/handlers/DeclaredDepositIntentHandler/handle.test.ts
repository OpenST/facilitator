// Copyright 2020 OpenST Ltd.
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

import * as web3utils from 'web3-utils';
import BigNumber from 'bignumber.js';

import assert from '../../../test_utils/assert';
import DeclaredDepositIntentHandler from '../../../../src/m1_facilitator/handlers/DeclaredDepositIntentHandler';
import Gateway, { GatewayType } from '../../../../src/m1_facilitator/models/Gateway';
import Message, { MessageType, MessageStatus } from '../../../../src/m1_facilitator/models/Message';
import MessageRepository from '../../../../src/m1_facilitator/repositories/MessageRepository';
import DepositIntentRepository from '../../../../src/m1_facilitator/repositories/DepositIntentRepository';
import GatewayRepository from '../../../../src/m1_facilitator/repositories/GatewayRepository';
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';

describe('DeclaredDepositIntentHandler::handle', (): void => {
  let declaredDepositIntentHandler: DeclaredDepositIntentHandler;
  let messageRepository: MessageRepository;
  let depositIntentRepository: DepositIntentRepository;
  let gatewayRepository: GatewayRepository;

  const record = {
    contractAddress: '0x0000000000000000000000000000000000000001',
    messageHash: web3utils.sha3('2'),
    intentHash: web3utils.sha3('10'),
    tokenAddress: '0x0000000000000000000000000000000000000002',
    beneficiary: '0x0000000000000000000000000000000000000050',
    amount: new BigNumber(20),
    feeGasLimit: new BigNumber(20),
    feeGasPrice: new BigNumber(40),
    blockNumber: new BigNumber('100'),
  };
  beforeEach(async (): Promise<void> => {
    const repositories = await Repositories.create();
    ({ depositIntentRepository, gatewayRepository, messageRepository } = repositories);
    const gateway = new Gateway(
      record.contractAddress,
      '0x0000000000000000000000000000000000000010',
      GatewayType.CONSENSUS,
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000030',
      new BigNumber(200),
    );
    await gatewayRepository.save(
      gateway,
    );

    declaredDepositIntentHandler = new DeclaredDepositIntentHandler(
      repositories.depositIntentRepository,
      repositories.gatewayRepository,
      repositories.messageRepository,
    );
  });

  it('should change source status of message from undeclared to declared if message'
    + ' is not present', async (): Promise<void> => {
    await declaredDepositIntentHandler.handle([record]);

    const message = await messageRepository.get(record.messageHash);

    assert.strictEqual(
      message && message.type,
      MessageType.Deposit,
      'Message type should be deposit',
    );

    assert.strictEqual(
      message && message.sourceStatus,
      MessageStatus.Declared,
      'Source status must be declared',
    );

    assert.strictEqual(
      message && message.targetStatus,
      MessageStatus.Undeclared,
      'Target status must be undeclared',
    );

    const depositIntent = await depositIntentRepository.get(record.messageHash);

    assert.isOk(
      depositIntent,
      `Record must be present for ${record.messageHash} in deposit intent model`,
    );
  });

  it('should create a deposit intent if message is not present is'
  + ' not present', async (): Promise<void> => {
    await declaredDepositIntentHandler.handle([record]);

    const depositIntent = await depositIntentRepository.get(record.messageHash);

    assert.isOk(
      depositIntent,
      `Record must be present for ${record.messageHash} in deposit intent model`,
    );
  });

  it('should change status of message from undeclared to declared for'
    + ' existing message', async (): Promise<void> => {
    await messageRepository.save(
      new Message(
        record.messageHash,
        MessageType.Deposit,
        MessageStatus.Undeclared,
        MessageStatus.Undeclared,
        '0x0000000000000000000000000000000000000050',
        new BigNumber(0),
        new BigNumber(0),
        new BigNumber(0),
        record.intentHash,
      ),
    );

    await declaredDepositIntentHandler.handle([record]);

    const message = await messageRepository.get(record.messageHash);

    assert.strictEqual(
      message && message.sourceStatus,
      MessageStatus.Declared,
      'Source status must be declared',
    );

    assert.strictEqual(
      message && message.targetStatus,
      MessageStatus.Undeclared,
      'Target status must be undeclared',
    );
  });

  it('should handle multiple records', async (): Promise<void> => {
    const record2 = {
      contractAddress: '0x0000000000000000000000000000000000000060',
      messageHash: web3utils.sha3('20'),
      intentHash: web3utils.sha3('100'),
      tokenAddress: '0x0000000000000000000000000000000000000062',
      feeGasLimit: new BigNumber(20),
      feeGasPrice: new BigNumber(40),
      blockNumber: new BigNumber('100'),
      beneficiary: '0x0000000000000000000000000000000000000070',
      amount: new BigNumber(20),
    };

    const gateway1 = new Gateway(
      record2.contractAddress,
      '0x0000000000000000000000000000000000000010',
      GatewayType.CONSENSUS,
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000030',
      new BigNumber(200),
    );
    await gatewayRepository.save(
      gateway1,
    );

    await declaredDepositIntentHandler.handle([record, record2]);

    const message = await messageRepository.get(record.messageHash);
    const message2 = await messageRepository.get(record2.messageHash);

    assert.strictEqual(
      message && message.sourceStatus,
      MessageStatus.Declared,
      `Source status for message ${record.messageHash} must be declared`,
    );

    assert.strictEqual(
      message && message.targetStatus,
      MessageStatus.Undeclared,
      `Target status for message ${record.messageHash} must be undeclared`,
    );

    assert.strictEqual(
      message2 && message2.sourceStatus,
      MessageStatus.Declared,
      `Source status for message ${record2.messageHash} must be declared`,
    );

    assert.strictEqual(
      message2 && message2.targetStatus,
      MessageStatus.Undeclared,
      `Target status for message ${record2.messageHash} must be undeclared`,
    );

  });
});
