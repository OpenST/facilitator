// /<reference path="util.ts"/>
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
import BigNumber from 'bignumber.js';

import {
  ContractEntity,
  ContractEntityAttributes,
  EntityType,
} from '../../../src/models/ContractEntityRepository';

import Database from '../../../src/models/Database';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const {assert} = chai;

interface TestConfigInterface {
  db: Database;
}

let config: TestConfigInterface;

describe('ContractEntityRepository::get', (): void => {

  let contractEntityAttributes: ContractEntityAttributes;

  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };

    contractEntityAttributes = {
      timestamp: new BigNumber('1'),
      contractAddress: '0x0000000000000000000000000000000000000002',
      entityType: EntityType.StakeProgressed
    };

    await config.db.contractEntityRepository.create(
      contractEntityAttributes,
    );
  });

  it('should pass when retrieving contract entity model', async (): Promise<void> => {
    const getResponse: ContractEntity | null = await config.db.contractEntityRepository.get(
      contractEntityAttributes
    );

    assert.notStrictEqual(
      getResponse,
      null,
      'get response should not be null'
    );

    assert.strictEqual(
      getResponse!.timestamp.eq(contractEntityAttributes.timestamp),
      true
    );
  });

  it('should fail when querying for non-existing contract address', async (): Promise<void> => {
    contractEntityAttributes.contractAddress = '0x0000000000000000000000000000000000000003';

    const getResponse = await config.db.contractEntityRepository.get(
      contractEntityAttributes,
    );

    assert.strictEqual(
      getResponse,
      null,
      'get response should be null'
    );
  });

  it('should fail when querying for non-existing entity type', async (): Promise<void> => {
    contractEntityAttributes.entityType = EntityType.MintProgressed;

    const getResponse = await config.db.contractEntityRepository.get(
      contractEntityAttributes,
    );

    assert.strictEqual(
      getResponse,
      null,
      'get response should be null'
    );
  });
});
