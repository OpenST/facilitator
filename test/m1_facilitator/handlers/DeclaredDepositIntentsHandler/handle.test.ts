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
import DeclaredDepositIntentsHandler from '../../../../src/m1_facilitator/handlers/DeclaredDepositIntentsHandler';
import Gateway, { GatewayType } from '../../../../src/m1_facilitator/models/Gateway';
import Message, { MessageType, MessageStatus } from '../../../../src/m1_facilitator/models/Message';
import MessageRepository from '../../../../src/m1_facilitator/repositories/MessageRepository';
import DepositIntentRepository from '../../../../src/m1_facilitator/repositories/DepositIntentRepository';
import GatewayRepository from '../../../../src/m1_facilitator/repositories/GatewayRepository';
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';

describe('DeclaredDepositIntentsHandler::handle', (): void => {
  let declaredDepositIntentsHandler: DeclaredDepositIntentsHandler;
  let messageRepository: MessageRepository;
  let depositIntentRepository: DepositIntentRepository;
  let gatewayRepository: GatewayRepository;

  const record1 = {
    contractAddress: '0x0000000000000000000000000000000000000001',
    messageHash: web3utils.sha3('2'),
    valueTokenAddress: '0x0000000000000000000000000000000000000002',
    beneficiary: '0x0000000000000000000000000000000000000050',
    amount: '20',
    feeGasLimit: '20',
    feeGasPrice: '20',
    blockNumber: '100',
  };
  beforeEach(async (): Promise<void> => {
    const repositories = await Repositories.create();
    ({ depositIntentRepository, gatewayRepository, messageRepository } = repositories);
    const gateway = new Gateway(
      record1.contractAddress,
      '0x0000000000000000000000000000000000000010',
      GatewayType.ERC20,
      '0x0000000000000000000000000000000000000001',
      new BigNumber(200),
      '0x0000000000000000000000000000000000000030',
    );
    await gatewayRepository.save(
      gateway,
    );

    declaredDepositIntentsHandler = new DeclaredDepositIntentsHandler(
      repositories.depositIntentRepository,
      repositories.gatewayRepository,
      repositories.messageRepository,
    );
  });

  async function assertMessageRepository(record: {
    messageHash: string;
    feeGasLimit: string;
    feeGasPrice: string;
    blockNumber: string;
  }): Promise<void> {
    const message = await messageRepository.get(record.messageHash);

    assert.strictEqual(
      message && message.type,
      MessageType.Deposit,
      'Message type must be deposit',
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

    assert.isOk(
      message && message.feeGasLimit && message.feeGasLimit.isEqualTo(
        new BigNumber(record.feeGasLimit),
      ),
      `Expected gas limit is ${record.feeGasLimit} but`
      + ` got ${message && message.feeGasLimit && message.feeGasLimit.toString(10)}`,
    );

    assert.isOk(
      message && message.feeGasPrice && message.feeGasPrice.isEqualTo(
        new BigNumber(record.feeGasPrice),
      ),
      `Expected gas limit is ${record.feeGasLimit && record.feeGasLimit} but`
      + ` got ${message && message.feeGasLimit && message.feeGasLimit.toString(10)}`,
    );

    assert.isOk(
      message && message.sourceDeclarationBlockNumber
      && message.sourceDeclarationBlockNumber.isEqualTo(
        new BigNumber(record.blockNumber),
      ),
      `Expected source declaration block number is ${record.blockNumber} but got`
      + `${
        message
        && message.sourceDeclarationBlockNumber && message.sourceDeclarationBlockNumber.toString(10)
      }`,
    );
  }

  async function assertDepositIntentRepository(record: {
    messageHash: string;
    valueTokenAddress: string;
    amount: string;
    beneficiary: string;
  }): Promise<void> {
    const depositIntent = await depositIntentRepository.get(record.messageHash);

    assert.isOk(
      depositIntent && depositIntent.amount && depositIntent.amount.isEqualTo(
        new BigNumber(record.amount),
      ),
      `Expected deposit amount is ${record.amount} but got `
      + `${depositIntent && depositIntent.amount && depositIntent.amount.toString(10)}`,
    );

    assert.strictEqual(
      depositIntent && depositIntent.tokenAddress,
      record.valueTokenAddress,
      'Incorrect value token address',
    );

    assert.strictEqual(
      depositIntent && depositIntent.beneficiary,
      record.beneficiary,
      'Incorrect beneficiary address',
    );
  }

  it('should change source status of message from undeclared to declared if message'
    + ' is not present', async (): Promise<void> => {
    await declaredDepositIntentsHandler.handle([record1]);

    await assertMessageRepository(record1);
    await assertDepositIntentRepository(record1);
  });

  it('should change status of message from undeclared to declared for'
    + ' existing message', async (): Promise<void> => {
    await messageRepository.save(
      new Message(
        record1.messageHash,
        MessageType.Deposit,
        MessageStatus.Undeclared,
        MessageStatus.Undeclared,
        '0x0000000000000000000000000000000000000050',
        new BigNumber(20),
        new BigNumber(20),
        new BigNumber(100),
      ),
    );

    await declaredDepositIntentsHandler.handle([record1]);

    await assertMessageRepository(record1);
  });

  it('should handle multiple records', async (): Promise<void> => {
    const record2 = {
      contractAddress: '0x0000000000000000000000000000000000000060',
      messageHash: web3utils.sha3('20'),
      valueTokenAddress: '0x0000000000000000000000000000000000000062',
      feeGasLimit: '20',
      feeGasPrice: '40',
      blockNumber: '100',
      beneficiary: '0x0000000000000000000000000000000000000070',
      amount: '20',
    };

    const gateway1 = new Gateway(
      record2.contractAddress,
      '0x0000000000000000000000000000000000000010',
      GatewayType.ERC20,
      '0x0000000000000000000000000000000000000001',
      new BigNumber(200),
      '0x0000000000000000000000000000000000000030',
    );
    await gatewayRepository.save(
      gateway1,
    );

    await declaredDepositIntentsHandler.handle([record1, record2]);

    await assertMessageRepository(record1);
    await assertMessageRepository(record2);
    await assertDepositIntentRepository(record1);
    await assertDepositIntentRepository(record2);
  });
});
