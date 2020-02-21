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

import * as web3Utils from 'web3-utils';

import BigNumber from 'bignumber.js';
import Repositories
  from '../../../../src/m1_facilitator/repositories/Repositories';
import DeclaredWithdrawIntentsHandler
  from '../../../../src/m1_facilitator/handlers/DeclaredWithdrawIntentsHandler';
import MessageRepository
  from '../../../../src/m1_facilitator/repositories/MessageRepository';
import WithdrawIntentRepository
  from '../../../../src/m1_facilitator/repositories/WithdrawIntentRepository';
import assert from '../../../test_utils/assert';
import Message, {
  MessageStatus,
  MessageType,
} from '../../../../src/m1_facilitator/models/Message';

describe('DeclaredWithdrawIntentsHandler::handle', () => {
  let handler: DeclaredWithdrawIntentsHandler;
  let messageRepository: MessageRepository;
  let withdrawIntentRepository: WithdrawIntentRepository;

  const withdrawIntentEntityRecord = {
    messageHash: web3Utils.sha3('1'),
    contractAddress: '0x0000000000000000000000000000000000000001',
    utilityTokenAddress: '0x0000000000000000000000000000000000000002',
    amount: '2',
    beneficiary: '0x0000000000000000000000000000000000000003',
  };

  beforeEach(async (): Promise<void> => {
    const repositories = await Repositories.create();
    ({ messageRepository, withdrawIntentRepository } = repositories);
    handler = new DeclaredWithdrawIntentsHandler(
      repositories.withdrawIntentRepository,
      repositories.messageRepository,
    );
  });

  it('should handle declared withdraw intent records', async (): Promise<void> => {
    await handler.handle([withdrawIntentEntityRecord]);

    const messageRecord = await messageRepository.get(
      withdrawIntentEntityRecord.messageHash,
    );
    const withdrawIntentRecord = await withdrawIntentRepository.get(
      withdrawIntentEntityRecord.messageHash,
    );

    assert.strictEqual(
      messageRecord && messageRecord.messageHash,
      withdrawIntentEntityRecord.messageHash,
      'Message hash mus match',
    );

    assert.strictEqual(
      messageRecord && messageRecord.sourceStatus,
      MessageStatus.Declared,
      'Message source status must be declared',
    );

    assert.strictEqual(
      messageRecord && messageRecord.targetStatus,
      MessageStatus.Undeclared,
      'Message target status must be declared',
    );

    assert.strictEqual(
      messageRecord && messageRecord.type,
      MessageType.Withdraw,
      'Message type must be withdraw',
    );

    assert.strictEqual(
      messageRecord && messageRecord.gatewayAddress,
      withdrawIntentEntityRecord.contractAddress,
      'Gateway address must match',
    );

    assert.strictEqual(
      withdrawIntentRecord && withdrawIntentRecord.messageHash,
      withdrawIntentEntityRecord.messageHash,
      'Message hash must match',
    );

    assert.strictEqual(
      withdrawIntentRecord && withdrawIntentRecord.beneficiary,
      withdrawIntentEntityRecord.beneficiary,
      'Beneficiary must match',
    );

    assert.strictEqual(
      withdrawIntentRecord && withdrawIntentRecord.tokenAddress,
      withdrawIntentEntityRecord.utilityTokenAddress,
      'Token address must match',
    );

    assert.isOk(
      withdrawIntentRecord
      && withdrawIntentRecord.amount
      && withdrawIntentRecord.amount.isEqualTo(
        new BigNumber(withdrawIntentEntityRecord.amount),
      ),
      'Amount must match',
    );
  });

  it('should update source status to declared if message already exists', async (): Promise<void> => {
    const existingMessage = new Message(
      web3Utils.sha3('1'),
      MessageType.Withdraw,
      MessageStatus.Undeclared,
      MessageStatus.Declared,
      '0x0000000000000000000000000000000000000001',
    );

    await messageRepository.save(existingMessage);

    await handler.handle([withdrawIntentEntityRecord]);

    const messageRecord = await messageRepository.get(
      withdrawIntentEntityRecord.messageHash,
    );

    assert.strictEqual(
      messageRecord && messageRecord.sourceStatus,
      MessageStatus.Declared,
      'Message source status must be declared',
    );
  });
});
