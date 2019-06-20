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


describe('StakeRequestRepository::create', (): void => {
  it('Checks creation of stake request model.', async (): Promise<void> => {
    const db = await Database.createInMemory();

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

    const stakeRequestResponse = await db.stakeRequestRepository.create(
      stakeRequestAttributes,
    );

    Util.checkStakeRequestAgainstAttributes(stakeRequestResponse, stakeRequestAttributes);

    const stakeRequest = await db.stakeRequestRepository.get(
      stakeRequestAttributes.stakeRequestHash,
    );

    assert.notStrictEqual(
      stakeRequest,
      null,
    );

    Util.checkStakeRequestAgainstAttributes(
      stakeRequest as StakeRequest,
      stakeRequestAttributes,
    );
  });

  it('Throws if a stake request already exists.', async (): Promise<void> => {
    const db = await Database.createInMemory();

    const stakeRequestAttributesA: StakeRequestAttributes = {
      stakeRequestHash: 'stakeRequestHash',
      messageHash: 'messageHashA',
      amount: 1,
      beneficiary: 'beneficiaryA',
      gasPrice: 2,
      gasLimit: 3,
      nonce: 4,
      gateway: 'gatewayA',
      stakerProxy: 'stakerProxyA',
    };

    const stakeRequestAttributesB: StakeRequestAttributes = {
      stakeRequestHash: 'stakeRequestHash',
      messageHash: 'messageHashB',
      amount: 5,
      beneficiary: 'beneficiaryB',
      gasPrice: 6,
      gasLimit: 7,
      nonce: 8,
      gateway: 'gatewayB',
      stakerProxy: 'stakerProxyB',
    };

    await db.stakeRequestRepository.create(
      stakeRequestAttributesA,
    );

    assert.isRejected(
      db.stakeRequestRepository.create(
        stakeRequestAttributesB,
      ),
    );
  });
});
