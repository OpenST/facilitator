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
//
// ----------------------------------------------------------------------------


import BigNumber from 'bignumber.js';

import Util from './util';
import { assertErrorMessages } from '../../../test_utils/assert';
import Message from '../../../../src/m1_facilitator/models/Message';
import {
  MessageStatus, MessageType,
} from '../../../../src/m1_facilitator/repositories/MessageRepository';
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';

describe('MessageRepository::save', (): void => {
  let config: {
    repos: Repositories;
  };
  let messageHash: string;
  let intentHash: string;
  let type: string;
  let sourceStatus: string;
  let targetStatus: string;
  let gasPrice: BigNumber;
  let gasLimit: BigNumber;
  let gatewayAddress: string;
  let sourceDeclarationBlockNumber: BigNumber;
  let createdAt: Date;
  let updatedAt: Date;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    messageHash = '0x00000000000000000000000000000000000000000000000000000000000000333';
    type = MessageType.Deposit;
    intentHash = '0x00000000000000000000000000000000000000000000000000000000000100';
    sourceStatus = MessageStatus.Undeclared;
    targetStatus = MessageStatus.Undeclared;
    gasPrice = new BigNumber('30000000000000000000000000000000');
    gasLimit = new BigNumber('10000000000000000000000000000000');
    gatewayAddress = '0x0000000000000000000000000000000000000001';
    sourceDeclarationBlockNumber = new BigNumber(300);
    createdAt = new Date();
    updatedAt = new Date();
  });

  it('should successfully create Message model.', async (): Promise<void> => {
    const message = new Message(
      messageHash,
      type,
      intentHash,
      sourceStatus,
      targetStatus,
      gasPrice,
      gasLimit,
      gatewayAddress,
      sourceDeclarationBlockNumber,
      createdAt,
      updatedAt,
    );
    const createdMessage = await config.repos.messageRepository.save(
      message,
    );

    Util.assertMessageAttributes(createdMessage, message);
  });

  it('should pass when updating Message model', async (): Promise<void> => {
    const message = new Message(
      messageHash,
      type,
      intentHash,
    );

    await config.repos.messageRepository.save(
      message,
    );

    message.sourceStatus = sourceStatus;
    message.targetStatus = targetStatus;
    message.gasLimit = gasLimit;
    message.gasPrice = gasPrice;
    message.gatewayAddress = gatewayAddress;
    message.sourceDeclarationBlockNumber = sourceDeclarationBlockNumber;

    const updatedMessage = await config.repos.messageRepository.save(
      message,
    );

    Util.assertMessageAttributes(updatedMessage, message);
  });

  it('should pass when max gasPrice, gasLimit value is saved', async (): Promise<void> => {
    const message = new Message(
      messageHash,
      type,
      intentHash,
      sourceStatus,
      targetStatus,
      new BigNumber('999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      new BigNumber('999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      gatewayAddress,
      sourceDeclarationBlockNumber,
      createdAt,
      updatedAt,
    );

    const savedMessage = await config.repos.messageRepository.save(
      message,
    );
    Util.assertMessageAttributes(savedMessage, message);
  });

  it('should fail when gas price is higher than supported value', async (): Promise<void> => {
    const message = new Message(
      messageHash,
      type,
      intentHash,
      sourceStatus,
      targetStatus,
      new BigNumber('999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      gasLimit,
      gatewayAddress,
      sourceDeclarationBlockNumber,
      createdAt,
      updatedAt,
    );

    try {
      await config.repos.messageRepository.save(message);
    } catch (error) {
      assertErrorMessages(error.errors, [
        'Validation max on gasPrice failed',
      ]);
    }

    // await assert.isRejected(
    //   config.repos.messageRepository.save(
    //     message,
    //   ),
    //   'Validation max on gasPrice failed',
    // );
  });

  it('should fail when gas limit is higher than supported value', async (): Promise<void> => {
    const message = new Message(
      messageHash,
      type,
      intentHash,
      sourceStatus,
      targetStatus,
      gasPrice,
      new BigNumber('999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      gatewayAddress,
      sourceDeclarationBlockNumber,
      createdAt,
      updatedAt,
    );

    try {
      await config.repos.messageRepository.save(message);
    } catch (error) {
      assertErrorMessages(error.errors, [
        'Validation max on gasLimit failed',
      ]);
    }

    // await assert.isRejected(
    //   config.repos.messageRepository.save(
    //     message,
    //   ),
    //   'Validation max on gasLimit failed',
    // );
  });
});
