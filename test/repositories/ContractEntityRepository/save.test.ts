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

import Repositories from '../../../src/repositories/Repositories';

import ContractEntity from '../../../src/models/ContractEntity';
import Util from './util';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

describe('ContractEntityRepository::save', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('should pass when creating contract entity model.', async (): Promise<void> => {
    const contractEntity = new ContractEntity(
      '0x0000000000000000000000000000000000000002',
      EntityType.StakeProgressed,
      new BigNumber(1),
    );
    const saveResponse = await config.repos.contractEntityRepository.save(
      contractEntity,
    );

    Util.assertion(saveResponse as ContractEntity, contractEntity);
  });

  it('should pass when updating contract entity model', async (): Promise<void> => {
    const contractEntity = new ContractEntity(
      '0x0000000000000000000000000000000000000002',
      EntityType.StakeProgressed,
      new BigNumber(1),
    );

    await config.repos.contractEntityRepository.save(
      contractEntity,
    );

    contractEntity.timestamp = new BigNumber(3);

    const updateResponse = await config.repos.contractEntityRepository.save(
      contractEntity,
    );

    Util.assertion(updateResponse as ContractEntity, contractEntity);
  });
});
