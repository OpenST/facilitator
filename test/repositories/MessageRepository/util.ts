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

import {
  MessageAttributes,
  Message,
} from '../../../src/repositories/MessageRepository';

import assert from '../../utils/assert';

const Util = {
  checkMessageAgainstAttributes(
    message: Message,
    messageAttributes: MessageAttributes,
  ): void {
    assert.strictEqual(
      message.messageHash,
      messageAttributes.messageHash,
      'messageHash should match',
    );

    assert.strictEqual(
      message.type,
      messageAttributes.type,
      'type should match',
    );

    assert.strictEqual(
      message.gatewayAddress,
      messageAttributes.gatewayAddress,
      'gatewayAddress should match',
    );

    assert.strictEqual(
      message.sourceStatus,
      messageAttributes.sourceStatus,
      'sourceStatus should match',
    );

    assert.strictEqual(
      message.targetStatus,
      messageAttributes.targetStatus,
      'targetStatus should match',
    );

    assert.notStrictEqual(
      message.gasPrice,
      messageAttributes.gasPrice,
      'gasPrice should match',
    );

    assert.notStrictEqual(
      message.gasLimit,
      messageAttributes.gasLimit,
      'gasLimit should match',
    );

    assert.notStrictEqual(
      message.nonce,
      messageAttributes.nonce,
      'nonce should match',
    );

    assert.strictEqual(
      message.sender,
      messageAttributes.sender,
      'sender should match',
    );

    assert.strictEqual(
      message.direction,
      messageAttributes.direction,
      'direction should match',
    );

    assert.notStrictEqual(
      message.sourceDeclarationBlockHeight,
      messageAttributes.sourceDeclarationBlockHeight,
      'sourceDeclarationBlockHeight should match',
    );

    if (messageAttributes.hashLock) {
      assert.strictEqual(
        message.hashLock,
        messageAttributes.hashLock,
        'hashLock should match',
      );
    }

    if (messageAttributes.secret) {
      assert.strictEqual(
        message.secret,
        messageAttributes.secret,
        'secret should match',
      );
    }
  },

};

export default Util;
