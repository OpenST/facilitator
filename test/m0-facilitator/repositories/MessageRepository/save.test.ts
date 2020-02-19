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


import 'mocha';

import BigNumber from 'bignumber.js';

import Message from '../../../../src/m0-facilitator/models/Message';
import {
  MessageDirection, MessageStatus, MessageType,
} from '../../../../src/m0-facilitator/repositories/MessageRepository';
import Repositories from '../../../../src/m0-facilitator/repositories/Repositories';
import Util from './util';
import assert from '../../test_utils/assert';

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

describe('MessageRepository::save', (): void => {
  let messageHash: string;
  let type: string;
  let gatewayAddress: string;
  let sourceStatus: string;
  let targetStatus: string;
  let gasPrice: BigNumber;
  let gasLimit: BigNumber;
  let nonce: BigNumber;
  let sender: string;
  let direction: string;
  let sourceDeclarationBlockHeight: BigNumber;
  let secret: string;
  let hashLock: string;
  let createdAt: Date;
  let updatedAt: Date;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    messageHash = '0x00000000000000000000000000000000000000000000000000000000000000333';
    type = MessageType.Stake;
    gatewayAddress = '0x0000000000000000000000000000000000000001';
    sourceStatus = MessageStatus.Declared;
    targetStatus = MessageStatus.Declared;
    gasPrice = new BigNumber('30000000000000000000000000000000');
    gasLimit = new BigNumber('10000000000000000000000000000000');
    nonce = new BigNumber(1);
    sender = '0x0000000000000000000000000000000000000002';
    direction = MessageDirection.OriginToAuxiliary;
    sourceDeclarationBlockHeight = new BigNumber(300);
    secret = '0x00000000000000000000000000000000000000000000000000000000000000334';
    hashLock = '0x00000000000000000000000000000000000000000000000000000000000000335';
    createdAt = new Date();
    updatedAt = new Date();
  });

  it('should pass when creating Message model.', async (): Promise<void> => {
    const message = new Message(
      messageHash,
      type,
      direction,
      gatewayAddress,
      sourceStatus,
      targetStatus,
      gasPrice,
      gasLimit,
      nonce,
      sender,
      sourceDeclarationBlockHeight,
      secret,
      hashLock,
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
      direction,
      gatewayAddress,
      sourceStatus,
      targetStatus,
      gasPrice,
      gasLimit,
      nonce,
      sender,
      sourceDeclarationBlockHeight,
      secret,
      hashLock,
      createdAt,
      updatedAt,
    );

    await config.repos.messageRepository.save(
      message,
    );

    message.sourceStatus = MessageStatus.Progressed;

    const updatedMessage = await config.repos.messageRepository.save(
      message,
    );

    Util.assertMessageAttributes(updatedMessage, message);
  });

  it('should pass when max gasPrice, gasLimit value is saved', async (): Promise<void> => {
    const message = new Message(
      messageHash,
      type,
      direction,
      gatewayAddress,
      sourceStatus,
      targetStatus,
      new BigNumber('999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      new BigNumber('999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      nonce,
      sender,
      sourceDeclarationBlockHeight,
      secret,
      hashLock,
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
      direction,
      gatewayAddress,
      sourceStatus,
      targetStatus,
      new BigNumber('99999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      gasLimit,
      nonce,
      sender,
      sourceDeclarationBlockHeight,
      secret,
      hashLock,
      createdAt,
      updatedAt,
    );

    await assert.isRejected(
      config.repos.messageRepository.save(
        message,
      ),
      'Validation max on gasPrice failed',
    );
  });

  it('should fail when gas limit is higher than supported value', async (): Promise<void> => {
    const message = new Message(
      messageHash,
      type,
      direction,
      gatewayAddress,
      sourceStatus,
      targetStatus,
      gasPrice,
      new BigNumber('99999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      nonce,
      sender,
      sourceDeclarationBlockHeight,
      secret,
      hashLock,
      createdAt,
      updatedAt,
    );

    await assert.isRejected(
      config.repos.messageRepository.save(
        message,
      ),
      'Validation max on gasLimit failed',
    );
  });
});
