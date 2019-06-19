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

describe('StakeRequestRepository::get', (): void => {
  it('Checks retrieval of an existing model.', async (): Promise<void> => {
    const db = Database.createInMemory();
    await db.sync();

    const stakeRequestAttributes: StakeRequestAttributes = {
      stakeRequestHash: 'stakeRequestHashA',
      messageHash: 'messageHashA',
      amount: 1,
      beneficiary: 'beneficiaryA',
      gasPrice: 2,
      gasLimit: 3,
      nonce: 4,
      gateway: 'gatewayA',
      stakerProxy: 'stakerProxyA',
    };

    await db.stakeRequestRepository.create(
      stakeRequestAttributes,
    );

    const stakeRequest = await db.stakeRequestRepository.get(
      stakeRequestAttributes.stakeRequestHash,
    );

    console.log((stakeRequest as StakeRequest).stakeRequestHash);

    assert.notStrictEqual(
      stakeRequest,
      null,
    );

    Util.checkStakeRequestAgainstAttributes(
      stakeRequest as StakeRequest,
      stakeRequestAttributes,
    );
  });

  it('Checks retrieval of non-existing model.', async (): Promise<void> => {
    const db = Database.createInMemory();
    await db.sync();

    const stakeRequestAttributes: StakeRequestAttributes = {
      stakeRequestHash: 'stakeRequestHashA',
      messageHash: 'messageHashA',
      amount: 1,
      beneficiary: 'beneficiaryA',
      gasPrice: 2,
      gasLimit: 3,
      nonce: 4,
      gateway: 'gatewayA',
      stakerProxy: 'stakerProxyA',
    };

    await db.stakeRequestRepository.create(
      stakeRequestAttributes,
    );

    const stakeRequest = await db.stakeRequestRepository.get(
      'nonExistinghash',
    );

    assert.strictEqual(
      stakeRequest,
      null,
    );
  });
});
