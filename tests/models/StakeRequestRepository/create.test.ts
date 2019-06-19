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

import { QueryTypes } from 'sequelize';

import {
  StakeRequestAttributes,
  StakeRequestModel,
} from '../../../src/models/StakeRequestRepository';

import Database from '../../../src/models/Database';


import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { assert } = chai;

function checkAttributesAgainstModel(
  stakeRequestAttributes: StakeRequestAttributes,
  stakeRequestInstance: StakeRequestModel,
): void {
  assert.strictEqual(
    stakeRequestAttributes.stakeRequestHash,
    stakeRequestInstance.stakeRequestHash,
  );

  assert.strictEqual(
    stakeRequestAttributes.messageHash,
    stakeRequestInstance.messageHash,
  );

  assert.strictEqual(
    stakeRequestAttributes.amount,
    stakeRequestInstance.amount,
  );

  assert.strictEqual(
    stakeRequestAttributes.beneficiary,
    stakeRequestInstance.beneficiary,
  );

  assert.strictEqual(
    stakeRequestAttributes.gasPrice,
    stakeRequestInstance.gasPrice,
  );

  assert.strictEqual(
    stakeRequestAttributes.gasLimit,
    stakeRequestInstance.gasLimit,
  );

  assert.strictEqual(
    stakeRequestAttributes.nonce,
    stakeRequestInstance.nonce,
  );

  assert.strictEqual(
    stakeRequestAttributes.gateway,
    stakeRequestInstance.gateway,
  );

  assert.strictEqual(
    stakeRequestAttributes.stakerProxy,
    stakeRequestInstance.stakerProxy,
  );

  assert.notStrictEqual(
    undefined,
    stakeRequestInstance.createdAt,
  );

  assert.notStrictEqual(
    undefined,
    stakeRequestInstance.updatedAt,
  );
}

function checkAttributesAgainstRaw(
  stakeRequestAttributes: StakeRequestAttributes,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stakeRequestRaw: any,
): void {
  assert.strictEqual(
    stakeRequestAttributes.stakeRequestHash,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.stakeRequestHash.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.messageHash,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.messageHash.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.amount,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.amount.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.beneficiary,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.beneficiary.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.gasPrice,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.gasPrice.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.gasLimit,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.gasLimit.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.nonce,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.nonce.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.gateway,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.gateway.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.stakerProxy,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.stakerProxy.field}`],
  );
}

describe('StakeRequestRepository::create', (): void => {
  it('Checks creation of stake request instance.', async (): Promise<void> => {
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

    const stakeRequestInstance = await db.stakeRequestRepository.create(
      stakeRequestAttributes,
    );

    checkAttributesAgainstModel(stakeRequestAttributes, stakeRequestInstance);

    const stakeRequests = await db.sequelize.query(
      `SELECT * FROM ${StakeRequestModel.getTableName()} `
    + `WHERE ${StakeRequestModel.rawAttributes.stakeRequestHash.field} = `
    + `'${stakeRequestAttributes.stakeRequestHash}'`,
      { type: QueryTypes.SELECT },
    );

    assert.strictEqual(
      stakeRequests.length,
      1,
    );

    checkAttributesAgainstRaw(stakeRequestAttributes, stakeRequests[0]);
  });

  it('Throws if a stake request already exists.', async (): Promise<void> => {
    const db = Database.createInMemory();
    await db.sync();

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
