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


import Message from '../../../src/models/Message';
import assert from '../../test_utils/assert';

const Util = {
  assertMessageAttributes(
    inputMessage: Message,
    expectedMessage: Message,
  ): void {
    assert.strictEqual(
      inputMessage.messageHash,
      expectedMessage.messageHash,
      'messageHash should match',
    );

    assert.strictEqual(
      inputMessage.type,
      expectedMessage.type,
      'type should match',
    );

    assert.strictEqual(
      inputMessage.gatewayAddress,
      expectedMessage.gatewayAddress,
      'gatewayAddress should match',
    );

    assert.strictEqual(
      inputMessage.sourceStatus,
      expectedMessage.sourceStatus,
      'sourceStatus should match',
    );

    assert.strictEqual(
      inputMessage.targetStatus,
      expectedMessage.targetStatus,
      'targetStatus should match',
    );

    assert.notStrictEqual(
      inputMessage.gasPrice,
      expectedMessage.gasPrice,
      'gasPrice should match',
    );

    assert.notStrictEqual(
      inputMessage.gasLimit,
      expectedMessage.gasLimit,
      'gasLimit should match',
    );

    assert.notStrictEqual(
      inputMessage.nonce,
      expectedMessage.nonce,
      'nonce should match',
    );

    assert.strictEqual(
      inputMessage.sender,
      expectedMessage.sender,
      'sender should match',
    );

    assert.strictEqual(
      inputMessage.direction,
      expectedMessage.direction,
      'direction should match',
    );

    assert.notStrictEqual(
      inputMessage.sourceDeclarationBlockHeight,
      expectedMessage.sourceDeclarationBlockHeight,
      'sourceDeclarationBlockHeight should match',
    );

    if (inputMessage.hashLock) {
      assert.strictEqual(
        inputMessage.hashLock,
        expectedMessage.hashLock,
        'hashLock should match',
      );
    }

    if (inputMessage.secret) {
      assert.strictEqual(
        inputMessage.secret,
        expectedMessage.secret,
        'secret should match',
      );
    }

    if (inputMessage.createdAt && expectedMessage.createdAt) {
      assert.strictEqual(
        inputMessage.createdAt.getTime(),
        expectedMessage.createdAt.getTime(),
        'Expected created at time is different than the one received in response',
      );
    }

    assert.isNotNull(
      inputMessage.updatedAt,
      'Updated at should not be null',
    );
  },

};

export default Util;
