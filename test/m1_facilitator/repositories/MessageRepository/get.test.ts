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

import Util from './util';
import assert from '../../../test_utils/assert';
import Message, { MessageStatus, MessageType } from '../../../../src/m1_facilitator/models/Message';
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';

describe('MessageRepository::get', (): void => {
  let message: Message;
  let config: {
    repos: Repositories;
  };
  let messageHash: string;
  let intentHash: string;
  let type: MessageType;
  let sourceStatus: MessageStatus;
  let targetStatus: MessageStatus;
  let feeGasPrice: BigNumber;
  let feeGasLimit: BigNumber;
  let gatewayAddress: string;
  let sourceDeclarationBlockNumber: BigNumber;
  let sender: string;
  let createdAt: Date;
  let updatedAt: Date;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    messageHash = '0x00000000000000000000000000000000000000000000000000000000000000333';
    type = MessageType.Deposit;
    intentHash = '0x00000000000000000000000000000000000000000000000000000000000100';
    sourceStatus = MessageStatus.Declared;
    targetStatus = MessageStatus.Declared;
    feeGasPrice = new BigNumber('30000000000000000000000000000000');
    feeGasLimit = new BigNumber('10000000000000000000000000000000');
    gatewayAddress = '0x0000000000000000000000000000000000000001';
    sourceDeclarationBlockNumber = new BigNumber(300);
    sender = '0x0000000000000000000000000000000000000005';
    createdAt = new Date();
    updatedAt = new Date();

    message = new Message(
      messageHash,
      type,
      sourceStatus,
      targetStatus,
      gatewayAddress,
      intentHash,
      feeGasPrice,
      feeGasLimit,
      sourceDeclarationBlockNumber,
      sender,
      createdAt,
      updatedAt,
    );
    await config.repos.messageRepository.save(
      message,
    );
  });

  it('should pass when retrieving Message model', async (): Promise<void> => {
    const getResponse = await config.repos.messageRepository.get(
      message.messageHash,
    );

    Util.assertMessageAttributes(getResponse as Message, message);
  });

  it('should return null when querying for non-existing '
    + 'messageHash', async (): Promise<void> => {
    const nonExistingMessageHash = '0x00000000000000000000000000000000000000000000000000000000000000222';

    const getResponse = await config.repos.messageRepository.get(
      nonExistingMessageHash,
    );

    assert.strictEqual(
      getResponse,
      null,
      'Non existing message object,',
    );
  });
});
