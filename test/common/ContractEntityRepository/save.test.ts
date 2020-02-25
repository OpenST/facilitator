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


import BigNumber from 'bignumber.js';

import ContractEntity, { M0EntityType } from '../../../../src/common/models/ContractEntity';
import Repositories from '../../../../src/m0_facilitator/repositories/Repositories';
import assert from '../../../test_utils/assert';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;
const createdAt = new Date();

describe('ContractEntityRepository::save', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('should pass when creating contract entity model.', async (): Promise<void> => {
    const contractEntity = new ContractEntity<M0EntityType>(
      '0x0000000000000000000000000000000000000002',
      M0EntityType.StakeProgresseds,
      new BigNumber(1),
      createdAt,
    );
    const saveResponse = await config.repos.contractEntityRepository.save(
      contractEntity,
    );

    Util.assertion(saveResponse, contractEntity);
  });

  it('should pass when updating contract entity model', async (): Promise<void> => {
    const contractEntity = new ContractEntity<M0EntityType>(
      '0x0000000000000000000000000000000000000002',
      M0EntityType.StakeProgresseds,
      new BigNumber(1),
      createdAt,
    );

    await config.repos.contractEntityRepository.save(
      contractEntity,
    );

    contractEntity.timestamp = new BigNumber(3);

    const updateResponse = await config.repos.contractEntityRepository.save(
      contractEntity,
    );

    Util.assertion(updateResponse, contractEntity);
  });

  it('should fail when invalid entity type is to be saved', async (): Promise<void> => {
    const invalidEntityType = 'invalid_entity_type' as M0EntityType;
    const contractEntity = new ContractEntity<M0EntityType>(
      '0x0000000000000000000000000000000000000002',
      invalidEntityType,
      new BigNumber(1),
      createdAt,
    );

    await assert.isRejected(
      config.repos.contractEntityRepository.save(contractEntity),
      `${invalidEntityType}`,
    );
  });

  it('should fail when timestamp is null', async (): Promise<void> => {
    const contractEntity = new ContractEntity<M0EntityType>(
      '0x0000000000000000000000000000000000000002',
      M0EntityType.StakeRequesteds,
      null as any,
      createdAt,
    );

    await assert.isRejected(
      config.repos.contractEntityRepository.save(contractEntity),
      'ContractEntity.timestamp cannot be null',
    );
  });

  it('should fail when timestamp is undefined', async (): Promise<void> => {
    const contractEntity = new ContractEntity<M0EntityType>(
      '0x0000000000000000000000000000000000000002',
      M0EntityType.StakeRequesteds,
      undefined as any,
      createdAt,
    );

    await assert.isRejected(
      config.repos.contractEntityRepository.save(contractEntity),
      'ContractEntity.timestamp cannot be null',
    );
  });
});
