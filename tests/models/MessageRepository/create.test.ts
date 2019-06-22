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

describe('MessageRepository::create', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Checks creation of message model.', async (): Promise<void> => {
    const messageAttributes: MessageAttributes = {
      messageHash: '0x497A49648885f7aaC3d761817F191ee1AFAF399CFHKHFKDHKSDK343DDFDFD',
      type: 'stakeAndMint',
      gatewayAddress: '0x497A49648885f7aaC3d761817F191ee1AFAF399C',
      sourceStatus: 'Undeclared',
      targetStatus: 'Undeclared',
      gasPrice: 1,
      gasLimit: 1,
      nonce: 1,
      sender: '0x497B49648885f7aaC3d761817F191ee1AFAF399C',
      direction: 'o2a',
      sourceDeclarationBlockHeight: 1,
    };

    const createResponse = await config.db.messageRepository.create(
      messageAttributes,
    );

    Util.checkMessageAgainstAttributes(createResponse, messageAttributes);

    const message = await config.db.messageRepository.get(
      messageAttributes.messageHash,
    );

    assert.notStrictEqual(
      message,
      null,
      'Newly created message does not exist.',
    );

    Util.checkMessageAgainstAttributes(
      message as Message,
      messageAttributes,
    );
  });

  it('Throws if a message '
    + 'with the same message hash already exists.', async (): Promise<void> => {
    const messageAttributesA: MessageAttributes = {
      messageHash: '0x497A49648885f7aaC3d761817F191ee1AFAF399CFHKHFKDHKSDK343DDFDFD',
      type: 'stakeAndMint',
      gatewayAddress: '0x497A49648885f7aaC3d761817F191ee1AFAF399C',
      sourceStatus: 'Undeclared',
      targetStatus: 'Undeclared',
      gasPrice: 1,
      gasLimit: 1,
      nonce: 1,
      sender: '0x497B49648885f7aaC3d761817F191ee1AFAF399C',
      direction: 'o2a',
      sourceDeclarationBlockHeight: 1,
    };

    // All members, except chainId from auxiliaryChainAttributesA.
    const messageAttributesB: MessageAttributes = {
      messageHash: '0x497A49648885f7aaC3d761817F191ee1AFAF399CFHKHFKDHKSDK343DDFDFD',
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

    await config.db.messageRepository.create(
      messageAttributesA,
    );

    return assert.isRejected(
      config.db.messageRepository.create(
        messageAttributesB,
      ),
      /^Failed to create a message*/,
      'Creation should fail as a message with the same message hash already exists.',
    );
  });

});
