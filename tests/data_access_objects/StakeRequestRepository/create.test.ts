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
import DatabaseWrapper from '../../../src/data_access_objects/DatabaseWrapper';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { assert } = chai;

describe('StakeRequestRepository::create', (): void => {
  it('Creates an entry.', async (): Promise<void> => {
    const dbWrapper: DatabaseWrapper = DatabaseWrapper.createInMemory();
    const stakeRequestRepository = new StakeRequestRepository(dbWrapper);
    await stakeRequestRepository.createTable();

    const stakeRequest = {
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

    await stakeRequestRepository.create(stakeRequest);

    const query = `SELECT * FROM ${StakeRequestRepository.tableName} `
    + `WHERE ${StakeRequestRepository.stakeRequestHashColumnName} = '${stakeRequest.stakeRequestHash}'`;

    const raw = await dbWrapper.get(query);

    assert.notStrictEqual(
      raw,
      undefined,
    );

    assert.strictEqual(
      raw[StakeRequestRepository.stakeRequestHashColumnName],
      stakeRequest.stakeRequestHash,
    );

    assert.strictEqual(
      raw[StakeRequestRepository.messageHashColumnName],
      stakeRequest.messageHash,
    );

    assert.strictEqual(
      raw[StakeRequestRepository.amountColumnName],
      stakeRequest.amount,
    );

    assert.strictEqual(
      raw[StakeRequestRepository.beneficiaryColumnName],
      stakeRequest.beneficiary,
    );

    assert.strictEqual(
      raw[StakeRequestRepository.gasPriceColumnName],
      stakeRequest.gasPrice,
    );

    assert.strictEqual(
      raw[StakeRequestRepository.gasLimitColumnName],
      stakeRequest.gasLimit,
    );

    assert.strictEqual(
      raw[StakeRequestRepository.nonceColumnName],
      stakeRequest.nonce,
    );

    assert.strictEqual(
      raw[StakeRequestRepository.gatewayColumnName],
      stakeRequest.gateway,
    );

    assert.strictEqual(
      raw[StakeRequestRepository.stakerProxyColumnName],
      stakeRequest.stakerProxy,
    );
  });

  it('Fails to create if exists.', async (): Promise<void> => {
    const dbWrapper: DatabaseWrapper = DatabaseWrapper.createInMemory();
    const stakeRequestRepository = new StakeRequestRepository(dbWrapper);
    await stakeRequestRepository.createTable();

    const stakeRequestA = {
      stakeRequestHash: 'stakeRequestHash',
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
      stakeRequestHash: 'stakeRequestHash',
      messageHash: 'messageHashB',
      amount: 3,
      beneficiary: 'beneficiaryB',
      gasPrice: 4,
      gasLimit: 5,
      nonce: 6,
      gateway: 'gatewayB',
      stakerProxy: 'stakerProxyB',
    };

    assert.isRejected(
      stakeRequestRepository.create(stakeRequestB),
    );
  });
});
