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

const { assert } = chai;

interface TestConfigInterface {
  db: Database;
}

let config: TestConfigInterface;
let contractEntityAttributes: ContractEntityAttributes;
describe('ContractEntityRepository::create', (): void => {
  function assertion(
    contractEntity: ContractEntity,
    timestamp: BigNumber,
  ): void {
    assert.strictEqual(
      contractEntity.timestamp.eq(timestamp),
      true,
      `Expected timestamp is ${timestamp} but`
      + `got ${contractEntity.timestamp}`,
    );
  }


  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };

    contractEntityAttributes = {
      timestamp: new BigNumber('1'),
      contractAddress: '0x0000000000000000000000000000000000000002',
      entityType: EntityType.StakeProgressed,
    };
    await config.db.contractEntityRepository.create(
      contractEntityAttributes,
    );
  });

  it('should pass when updating contract entity model.', async (): Promise<void> => {
    contractEntityAttributes.timestamp = new BigNumber(3);
    await config.db.contractEntityRepository.update(
      contractEntityAttributes,
    );

    const response = await config.db.contractEntityRepository.get(
      contractEntityAttributes,
    );

    assertion(response as ContractEntity, contractEntityAttributes.timestamp);
  });

  it('should fail for non-existing contract address',
    async (): Promise<void> => {
      contractEntityAttributes.contractAddress = '0x0000000000000000000000000000000000000003';

      const recordUpdated = await config.db.contractEntityRepository.update(
        contractEntityAttributes,
      );

      assert.strictEqual(
        recordUpdated[0],
        0,
        `Expected number of records to be updated should be 0 but got ${recordUpdated[0]}`,
      );
    });

  it('should fail when updating with entity whose record is not created',
    async (): Promise<void> => {
      contractEntityAttributes.entityType = EntityType.MintProgressed;

      const recordUpdated = await config.db.contractEntityRepository.update(
        contractEntityAttributes,
      );

      assert.strictEqual(
        recordUpdated[0],
        0,
        `Expected number of records to be updated should be 0 but got ${recordUpdated[0]}`,
      );
    });
});
