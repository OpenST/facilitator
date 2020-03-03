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

import BigNumber from 'bignumber.js';
import * as web3Utils from 'web3-utils';
import Repositories
  from '../../../../src/m1_facilitator/repositories/Repositories';
import MessageRepository
  from '../../../../src/m1_facilitator/repositories/MessageRepository';
import Message, {
  MessageStatus,
  MessageType,
} from '../../../../src/m1_facilitator/models/Message';
import assert from '../../../test_utils/assert';

describe('MessageRepository:getMessageForConfirmation', (): void => {
  let messageRepository: MessageRepository;
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const messageType = MessageType.Deposit;
  const blockHeight = new BigNumber('180');
  let messages: Message[];

  beforeEach(async (): Promise<void> => {
    ({ messageRepository } = (await Repositories.create()));

    messages = [

      // message that satisfies the condition.
      new Message(
        web3Utils.sha3('1'),
        messageType,
        MessageStatus.Declared,
        MessageStatus.Undeclared,
        gatewayAddress,
        new BigNumber('1'),
        new BigNumber('1'),
        new BigNumber('100'),
      ),
      // message from different gateway.
      new Message(
        web3Utils.sha3('2'),
        messageType,
        MessageStatus.Declared,
        MessageStatus.Undeclared,
        '0x0000000000000000000000000000000000000002',
        new BigNumber('1'),
        new BigNumber('1'),
        new BigNumber('100'),
      ),
      // message with target status Declared.
      new Message(
        web3Utils.sha3('3'),
        messageType,
        MessageStatus.Declared,
        MessageStatus.Declared,
        gatewayAddress,
        new BigNumber('1'),
        new BigNumber('1'),
        new BigNumber('100'),
      ),
      // message with source status undeclared.
      new Message(
        web3Utils.sha3('4'),
        messageType,
        MessageStatus.Undeclared,
        MessageStatus.Undeclared,
        gatewayAddress,
        new BigNumber('1'),
        new BigNumber('1'),
        new BigNumber('100'),
      ),
      // message with with source declaration blockheight is greater.
      new Message(
        web3Utils.sha3('5'),
        MessageType.Deposit,
        MessageStatus.Undeclared,
        MessageStatus.Undeclared,
        gatewayAddress,
        new BigNumber('1'),
        new BigNumber('1'),
        new BigNumber('10000'),
      ),
      // another message that satisfies the condition.
      new Message(
        web3Utils.sha3('6'),
        MessageType.Deposit,
        MessageStatus.Declared,
        MessageStatus.Undeclared,
        gatewayAddress,
        new BigNumber('1'),
        new BigNumber('1'),
        new BigNumber('151'),
      ),
    ];

    const savePromises = messages.map(
      async (message): Promise<Message> => messageRepository.save(message),
    );
    await Promise.all(savePromises);
  });


  it('should only return pending messages ', async (): Promise<void> => {
    const pendingMessages = await messageRepository.getMessagesForConfirmation(
      gatewayAddress,
      blockHeight,
    );

    assert.strictEqual(
      pendingMessages.length,
      2,
      'There should be 2 pending messages.',
    );

    assert.strictEqual(
      pendingMessages[0].messageHash,
      messages[0].messageHash,
      'Message hash must match',
    );

    assert.strictEqual(
      pendingMessages[1].messageHash,
      messages[5].messageHash,
      'Message hash must match',
    );
  });
});
