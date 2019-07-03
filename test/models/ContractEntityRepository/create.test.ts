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
  ContractEntityAttributes,
  EntityType,
} from '../../../src/models/ContractEntityRepository';

import Database from '../../../src/models/Database';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const { assert } = chai;

interface TestConfigInterface {
  db: Database;
}

let config: TestConfigInterface;

describe('ContractEntityRepository::create', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('should pass when creating contract entity model.', async (): Promise<void> => {
    const contractEntityAttributes: ContractEntityAttributes = {
      timestamp: new BigNumber('1'),
      contractAddress: '0x0000000000000000000000000000000000000002',
      entityType: EntityType.StakeProgressed,
    };

    const createResponse = await config.db.contractEntityRepository.create(
      contractEntityAttributes,
    );

    assert.strictEqual(
      createResponse.entityType,
      EntityType.StakeProgressed,
      'Incorrect entity type created',
    );

    assert.strictEqual(
      createResponse.contractAddress,
      contractEntityAttributes.contractAddress,
      'Incorrect contract address created',
    );

    assert.strictEqual(
      createResponse.timestamp.eq(contractEntityAttributes.timestamp),
      true,
      `Expected timestamp is ${contractEntityAttributes.timestamp} but got`
      + `${createResponse.timestamp}`,
    );
  });

  it('should fail when creating for same contract address and entitytype', async (): Promise<void> => {
    const contractEntityAttributes: ContractEntityAttributes = {
      timestamp: new BigNumber('1'),
      contractAddress: '0x0000000000000000000000000000000000000002',
      entityType: EntityType.StakeProgressed,
    };

    await config.db.contractEntityRepository.create(
      contractEntityAttributes,
    );

    assert.isRejected(
      config.db.contractEntityRepository.create(
        contractEntityAttributes,
      ),
      'Failed to create a ContractEntity',
      'Creation should fail as entry is already with same contract address and entity type',
    );
  });
});
