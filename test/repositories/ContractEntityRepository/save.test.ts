import BigNumber from 'bignumber.js';
import assert from '../../test_utils/assert';

import Repositories from '../../../src/repositories/Repositories';

import ContractEntity, { EntityType } from '../../../src/models/ContractEntity';
import Util from './util';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

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
    const contractEntity = new ContractEntity(
      '0x0000000000000000000000000000000000000002',
      EntityType.StakeProgresseds,
      new BigNumber(1),
      createdAt,
    );
    const saveResponse = await config.repos.contractEntityRepository.save(
      contractEntity,
    );

    Util.assertion(saveResponse, contractEntity);
  });

  it('should pass when updating contract entity model', async (): Promise<void> => {
    const contractEntity = new ContractEntity(
      '0x0000000000000000000000000000000000000002',
      EntityType.StakeProgresseds,
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
    const invalidEntityType = 'invalid_entity_type' as EntityType;
    const contractEntity = new ContractEntity(
      '0x0000000000000000000000000000000000000002',
      invalidEntityType,
      new BigNumber(1),
      createdAt,
    );

    assert.isRejected(
      config.repos.contractEntityRepository.save(contractEntity),
      `${invalidEntityType}`
    );
  });
});
