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

import ContractEntity, { EntityType } from '../../../../src/m0-facilitator/models/ContractEntity';
import Repositories from '../../../../src/m0-facilitator/repositories/Repositories';
import assert from '../../test_utils/assert';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;
const createdAt = new Date();
const updatedAt = new Date();

describe('ContractEntityRepository::get', (): void => {
  let conEntity: ContractEntity;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };

    conEntity = new ContractEntity(
      '0x0000000000000000000000000000000000000002',
      EntityType.StakeProgresseds,
      new BigNumber(1),
      createdAt,
      updatedAt,
    );
    await config.repos.contractEntityRepository.save(
      conEntity,
    );
  });

  it('should pass when retrieving contract entity model', async (): Promise<void> => {
    const getResponse = await config.repos.contractEntityRepository.get(
      conEntity.contractAddress,
      conEntity.entityType,
    );
    Util.assertion(getResponse as ContractEntity, conEntity);
  });

  it('should pass when contract addresses are different and '
    + 'entities are same', async (): Promise<void> => {
    const firstResponse = await config.repos.contractEntityRepository.get(
      conEntity.contractAddress,
      conEntity.entityType,
    );
    Util.assertion(firstResponse as ContractEntity, conEntity);

    const secondConEntity = new ContractEntity(
      '0x0000000000000000000000000000000000000009',
      EntityType.StakeProgresseds,
      new BigNumber(1),
      createdAt,
      updatedAt,
    );

    await config.repos.contractEntityRepository.save(
      secondConEntity,
    );

    const secondReponse = await config.repos.contractEntityRepository.get(
      secondConEntity.contractAddress,
      secondConEntity.entityType,
    );
    Util.assertion(secondReponse as ContractEntity, secondConEntity);
  });

  it('should return null when querying for non-existing '
    + 'contract address', async (): Promise<void> => {
    conEntity.contractAddress = '0x0000000000000000000000000000000000000003';

    const getResponse = await config.repos.contractEntityRepository.get(
      conEntity.contractAddress,
      conEntity.entityType,
    );

    assert.strictEqual(
      getResponse,
      null,
      'get response should be null',
    );
  });

  it('should return null when querying for non-existing'
    + ' entity type', async (): Promise<void> => {
    conEntity.entityType = EntityType.MintProgresseds;

    const getResponse = await config.repos.contractEntityRepository.get(
      conEntity.contractAddress,
      conEntity.entityType,
    );

    assert.strictEqual(
      getResponse,
      null,
      'get response should be null',
    );
  });
});
