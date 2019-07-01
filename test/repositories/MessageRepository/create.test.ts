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
} from '../../../src/repositories/MessageRepository';

import Repositories from '../../../src/repositories/Repositories';

import Util from './util';

import assert from '../../utils/assert';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('MessageRepository::create', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks creation of message model.', async (): Promise<void> => {
    const messageAttributes: MessageAttributes = {
      messageHash: '0x00000000000000000000000000000000000000000000000000001',
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

    const createResponse = await config.repos.messageRepository.create(
      messageAttributes,
    );

    Util.checkMessageAgainstAttributes(createResponse, messageAttributes);

    const message = await config.repos.messageRepository.get(
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
      messageHash: '0x000000000000000000000000000000000000000000000000000001',
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

    // All members, except messageHash are different from messageAttributesA.
    const messageAttributesB: MessageAttributes = {
      messageHash: '0x000000000000000000000000000000000000000000000000000001',
      type: MessageType.Redeem,
      gatewayAddress: '0x0000000000000000000000000000000000000003',
      sourceStatus: MessageStatus.Undeclared,
      targetStatus: MessageStatus.Declared,
      gasPrice: new BigNumber('2'),
      gasLimit: new BigNumber('2'),
      nonce: new BigNumber('2'),
      sender: '0x0000000000000000000000000000000000000004',
      direction: MessageDirection.AuxiliaryToOrigin,
      sourceDeclarationBlockHeight: new BigNumber('2'),
    };

    await config.repos.messageRepository.create(
      messageAttributesA,
    );

    return assert.isRejected(
      config.repos.messageRepository.create(
        messageAttributesB,
      ),
      /^Failed to create a message*/,
      'Creation should fail as a message with the same message hash already exists.',
    );
  });
});
