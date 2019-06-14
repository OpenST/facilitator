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

import StakeRequestRepository from '../../../src/data_access_objects/StakeRequestRepository';
import StakeRequest from '../../../src/data_access_objects/StakeRequestInterface';
import DatabaseWrapper from '../../../src/data_access_objects/DatabaseWrapper';

import chai = require('chai');

const { assert } = chai;

describe('StakeRequestRepository::get', (): void => {
  it('Returns undefined if does not exist.', async (): Promise<void> => {
    const dbWrapper: DatabaseWrapper = DatabaseWrapper.createInMemory();
    const stakeRequestRepository = new StakeRequestRepository(dbWrapper);
    await stakeRequestRepository.createTable();

    const result = await stakeRequestRepository.get('non-existing-hash');

    assert.strictEqual(
      result,
      undefined,
    );
  });

  it('Returns correct value if exists.', async (): Promise<void> => {
    const dbWrapper: DatabaseWrapper = DatabaseWrapper.createInMemory();
    const stakeRequestRepository = new StakeRequestRepository(dbWrapper);
    await stakeRequestRepository.createTable();

    const stakeRequestA = {
      stakeRequestHash: 'stakeRequestHashA',
      messageHash: 'messageHashA',
      amount: 2,
      beneficiary: 'beneficiaryA',
      gasPrice: 3,
      gasLimit: 4,
      nonce: 5,
      gateway: 'gatewayA',
      stakerProxy: 'stakerProxyA',
    };
    await stakeRequestRepository.create(stakeRequestA);

    const stakeRequestB = {
      stakeRequestHash: 'stakeRequestHashB',
      messageHash: 'messageHashB',
      amount: 3,
      beneficiary: 'beneficiaryB',
      gasPrice: 4,
      gasLimit: 5,
      nonce: 6,
      gateway: 'gatewayB',
      stakerProxy: 'stakerProxyB',
    };
    await stakeRequestRepository.create(stakeRequestB);

    const resultA = await stakeRequestRepository.get(stakeRequestA.stakeRequestHash);

    assert.notStrictEqual(
      resultA,
      undefined,
    );

    const rawA: StakeRequest = resultA as StakeRequest;

    assert.deepEqual(
      rawA,
      stakeRequestA,
    );

    const resultB = await stakeRequestRepository.get(stakeRequestB.stakeRequestHash);

    assert.notStrictEqual(
      resultB,
      undefined,
    );

    const rawB: StakeRequest = resultB as StakeRequest;

    assert.deepEqual(
      rawB,
      stakeRequestB,
    );
  });
});
