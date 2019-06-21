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
  StakeRequestAttributes,
  StakeRequest,
} from '../../../src/models/StakeRequestRepository';
import Database from '../../../src/models/Database';

import Util from './util';

import assert = require('assert');

interface TestConfigInterface {
  db: Database;
}
let config: TestConfigInterface;

describe('StakeRequestRepository::get', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Checks retrieval of an existing stake request.', async (): Promise<void> => {
    const stakeRequestAttributes: StakeRequestAttributes = {
      stakeRequestHash: 'stakeRequestHash',
      messageHash: 'messageHash',
      amount: 1,
      beneficiary: 'beneficiary',
      gasPrice: 2,
      gasLimit: 3,
      nonce: 4,
      gateway: 'gateway',
      stakerProxy: 'stakerProxy',
    };

    await config.db.stakeRequestRepository.create(
      stakeRequestAttributes,
    );

    const stakeRequest = await config.db.stakeRequestRepository.get(
      stakeRequestAttributes.stakeRequestHash,
    );

    assert.notStrictEqual(
      stakeRequest,
      null,
      'Stake request should exists as it has been just created.',
    );

    Util.checkStakeRequestAgainstAttributes(
      stakeRequest as StakeRequest,
      stakeRequestAttributes,
    );
  });

  it('Checks retrieval of non-existing model.', async (): Promise<void> => {
    const stakeRequest = await config.db.stakeRequestRepository.get(
      'nonExistingHash',
    );

    assert.strictEqual(
      stakeRequest,
      null,
      'Stake request with \'nonExistingHash\' does not exist.',
    );
  });
});
