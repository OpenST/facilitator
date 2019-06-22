///<reference path="util.ts"/>
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

import {
  MessageAttributes,
  Message,
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

  it('Checks updation of auxiliary message.', async (): Promise<void> => {
    const createMessageAttributes: MessageAttributes = {
      messageHash: 'messageHash',
      type: 'redeemAndUnstake',
      gatewayAddress: '0x477A49648885f7aaC3d761817F191ee1AFAF399C',
      sourceStatus: 'Declared',
      targetStatus: 'Progressed',
      gasPrice: 1,
      gasLimit: 1,
      nonce: 2,
      sender: '0x397B49648885f7aaC3d761817F191ee1AFAF399C',
      direction: 'a2o',
      sourceDeclarationBlockHeight: 2,
    };

    const objectForUpdate = await config.db.messageRepository.create(
      createMessageAttributes,
    );

    Util.checkMessageAgainstAttributes(objectForUpdate, createMessageAttributes);

    objectForUpdate.secret = 'secret';
    objectForUpdate.hashLock = 'hashLock';

    await config.db.messageRepository.update(
      objectForUpdate,
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
      type: 'redeemAndUnstake',
      gatewayAddress: '0x477A49648885f7aaC3d761817F191ee1AFAF399C',
      sourceStatus: 'Declared',
      targetStatus: 'Progressed',
      gasPrice: 1,
      gasLimit: 1,
      nonce: 2,
      sender: '0x397B49648885f7aaC3d761817F191ee1AFAF399C',
      direction: 'a2o',
      sourceDeclarationBlockHeight: 2,
    };

    const messageUpdateResponse = await config.db.messageRepository.update(
      messageAttributes,
    );

    assert.strictEqual(
      messageUpdateResponse[0],
      0,
      'Should return 0 as no rows were updated'
    );

    const updatedAuxiliaryChain = await config.db.messageRepository.get(messageAttributes.messageHash);

    return assert.strictEqual(
      updatedAuxiliaryChain,
      null,
    );
  });

});
