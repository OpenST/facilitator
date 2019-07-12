import BigNumber from 'bignumber.js';

import {
  EntityType,
} from '../../../src/repositories/ContractEntityRepository';

import ContractEntity from '../../../src/models/ContractEntity';
import { EntityType } from '../../../src/repositories/ContractEntityRepository';
import Repositories from '../../../src/repositories/Repositories';
import ContractEntity from '../../../src/models/ContractEntity';
import ContractEntity, { EntityType } from '../../../src/models/ContractEntity';
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
