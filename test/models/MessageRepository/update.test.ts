// /<reference path="util.ts"/>
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

import {
  MessageAttributes,
  Message,
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../../../src/models/MessageRepository';

import Database from '../../../src/models/Database';

import Util from './util';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { assert } = chai;

interface TestConfigInterface {
  db: Database;
}
let config: TestConfigInterface;

describe('MessageRepository::update', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Checks updation of message.', async (): Promise<void> => {
    const createMessageAttributes: MessageAttributes = {
      messageHash: 'messageHash',
      type: MessageType.Stake,
      gatewayAddress: '0x0000000000000000000000000000000000000001',
      sourceStatus: MessageStatus.Declared,
      targetStatus: MessageStatus.Undeclared,
      gasPrice: new BigNumber('1'),
      gasLimit: new BigNumber('1'),
      nonce: new BigNumber('1'),
      sender: '0x0000000000000000000000000000000000000002',
      direction: MessageDirection.OriginToAuxiliary,
      sourceDeclarationBlockHeight: new BigNumber('1'),
    };

    const objectForUpdate = await config.db.messageRepository.create(
      createMessageAttributes,
    );

    Util.checkMessageAgainstAttributes(objectForUpdate, createMessageAttributes);

    objectForUpdate.secret = 'secret';
    objectForUpdate.hashLock = 'hashLock';

    const updated = await config.db.messageRepository.update(
      objectForUpdate,
    );

    assert.isOk(
      updated,
      'An entry should be updated, as the message hash in the attributes exists.',
    );

    const updatedMessage = await config.db.messageRepository.get(objectForUpdate.messageHash);

    Util.checkMessageAgainstAttributes(
      updatedMessage as Message,
      objectForUpdate,
    );
  });

  it('Updation should fail for a non existing message ', async (): Promise<void> => {
    const messageAttributes: MessageAttributes = {
      messageHash: 'nonExistingMessageHash',
      type: MessageType.Stake,
      gatewayAddress: '0x0000000000000000000000000000000000000001',
      sourceStatus: MessageStatus.Declared,
      targetStatus: MessageStatus.Undeclared,
      gasPrice: new BigNumber('1'),
      gasLimit: new BigNumber('1'),
      nonce: new BigNumber('1'),
      sender: '0x0000000000000000000000000000000000000002',
      direction: MessageDirection.OriginToAuxiliary,
      sourceDeclarationBlockHeight: new BigNumber('1'),
    };

    const updated = await config.db.messageRepository.update(
      messageAttributes,
    );

    assert.isNotOk(
      updated,
      'The message hash in the passed attributes does not exist, hence no update.',
    );

    const updatedMessage = await config.db.messageRepository.get(messageAttributes.messageHash);

    return assert.strictEqual(
      updatedMessage,
      null,
    );
  });
});
