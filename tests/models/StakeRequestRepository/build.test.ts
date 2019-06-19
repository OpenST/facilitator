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

import checkAttributesAgainstModel from './util';

import assert = require('assert');


describe('StakeRequestRepository::build', (): void => {
  it('Checks building of a stake request model.', async (): Promise<void> => {
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

    const nonPersistenStakeRequestModel = await db.stakeRequestRepository.build(
      stakeRequestAttributes,
    );

    checkAttributesAgainstModel(
      stakeRequestAttributes,
      nonPersistenStakeRequestModel,
    );

    const stakeRequestModel = await db.stakeRequestRepository.get(
      stakeRequestAttributes.stakeRequestHash,
    );

    assert.strictEqual(
      stakeRequestModel,
      null,
    );

    const stakeRequests = await db.sequelize.query(
      `SELECT * FROM ${StakeRequestModel.getTableName()} `
    + `WHERE ${StakeRequestModel.rawAttributes.stakeRequestHash.field} = `
    + `'${stakeRequestAttributes.stakeRequestHash}'`,
      { type: QueryTypes.SELECT },
    );

    assert.strictEqual(
      stakeRequests.length,
      0,
    );
  });

  it('Checks creation of the same non persistent model object.', async (): Promise<void> => {
    const db = Database.createInMemory();
    await db.sync();

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

    await db.stakeRequestRepository.build(
      stakeRequestAttributes,
    );

    await db.stakeRequestRepository.build(
      stakeRequestAttributes,
    );
  });
});
