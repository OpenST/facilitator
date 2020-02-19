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

import * as Web3Utils from 'web3-utils';

import * as assert from 'assert';
import Utils from '../../../src/m0-facilitator/Utils';

describe('AcceptRedeemRequestService::generateSecret', (): void => {
  it('Checks that secret maches hash lock.', async (): Promise<void> => {
    const {
      secret,
      hashLock,
    } = Utils.generateSecret();

    assert.strictEqual(
      Web3Utils.keccak256(secret),
      hashLock,
      'The secret matches to the hash lock.',
    );
  });

  it('Checks that generated secret is different.', async (): Promise<void> => {
    const {
      secret: secret1,
    } = Utils.generateSecret();

    const {
      secret: secret2,
    } = Utils.generateSecret();

    const {
      secret: secret3,
    } = Utils.generateSecret();

    assert.notStrictEqual(
      secret1,
      secret2,
      'Generated secrets are different.',
    );

    assert.notStrictEqual(
      secret1,
      secret3,
      'Generated secrets are different.',
    );

    assert.notStrictEqual(
      secret2,
      secret3,
      'Generated secrets are different.',
    );
  });
});
