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
const { assert } = chai;

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;
const createdAt = new Date();

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
