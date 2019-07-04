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
  EntityType,
} from '../../../src/repositories/ContractEntityRepository';

import Database from '../../../src/models/Database';

import ContractEntity from '../../../src/models/ContractEntity';
import Utils from './utils';

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
    const contractEntity: ContractEntity = {
      timestamp: new BigNumber('1'),
      contractAddress: '0x0000000000000000000000000000000000000002',
      entityType: EntityType.StakeProgressed,
    };

    const createResponse = await config.db.contractEntityRepository.create(
      contractEntity,
    );

    Utils.assertion(createResponse, contractEntity);
  });

  it('should fail when creating for same contract address and '
    + 'entity type', async (): Promise<void> => {
    const contractEntity: ContractEntity = {
      timestamp: new BigNumber('1'),
      contractAddress: '0x0000000000000000000000000000000000000002',
      entityType: EntityType.StakeProgressed,
    };

    await config.db.contractEntityRepository.create(
      contractEntity,
    );

    assert.isRejected(
      config.db.contractEntityRepository.create(
        contractEntity,
      ),
      'Failed to create a contractEntity',
      'Creation should fail as entry is already with same contract address and entity type',
    );
  });
});
