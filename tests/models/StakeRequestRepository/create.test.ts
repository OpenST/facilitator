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

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { assert } = chai;

interface TestConfigInterface {
  db: Database;
}
let config: TestConfigInterface;

describe('StakeRequestRepository::create', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Checks creation of stake request model.', async (): Promise<void> => {
    const stakeRequestAttributes: StakeRequestAttributes = {
      stakeRequestHash: 'stakeRequestHash',
      amount: 1,
      beneficiary: 'beneficiary',
      gasPrice: 2,
      gasLimit: 3,
      nonce: 4,
      gateway: 'gateway',
      stakerProxy: 'stakerProxy',
    };

    const stakeRequestResponse = await config.db.stakeRequestRepository.create(
      stakeRequestAttributes,
    );

    Util.checkStakeRequestAgainstAttributes(stakeRequestResponse, stakeRequestAttributes);

    const stakeRequest = await config.db.stakeRequestRepository.get(
      stakeRequestAttributes.stakeRequestHash,
    );

    assert.notStrictEqual(
      stakeRequest,
      null,
      'Newly created stake request does not exist.',
    );

    Util.checkStakeRequestAgainstAttributes(
      stakeRequest as StakeRequest,
      stakeRequestAttributes,
    );
  });

  it('Throws if a stake request '
  + 'with the same stake request\'s hash already exists.', async (): Promise<void> => {
    const stakeRequestAttributesA: StakeRequestAttributes = {
      stakeRequestHash: 'stakeRequestHash',
      amount: 1,
      beneficiary: 'beneficiaryA',
      gasPrice: 2,
      gasLimit: 3,
      nonce: 4,
      gateway: 'gatewayA',
      stakerProxy: 'stakerProxyA',
    };

    // All members, except stakeRequestHash differs from stakeRequestAttributesA.
    const stakeRequestAttributesB: StakeRequestAttributes = {
      stakeRequestHash: 'stakeRequestHash',
      amount: 5,
      beneficiary: 'beneficiaryB',
      gasPrice: 6,
      gasLimit: 7,
      nonce: 8,
      gateway: 'gatewayB',
      stakerProxy: 'stakerProxyB',
    };

    await config.db.stakeRequestRepository.create(
      stakeRequestAttributesA,
    );

    return assert.isRejected(
      config.db.stakeRequestRepository.create(
        stakeRequestAttributesB,
      ),
      /^Failed to create a stake request*/,
      'Creation should fail as a stake request with the same hash already exists.',
    );
  });
});
