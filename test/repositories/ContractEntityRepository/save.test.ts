import 'mocha';
import BigNumber from 'bignumber.js';

import {
  EntityType,
} from '../../../src/repositories/ContractEntityRepository';

import Repositories from '../../../src/repositories/Repositories';

import ContractEntity from '../../../src/models/ContractEntity';
// import Util from './util';

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
    await config.repos.contractEntityRepository.save(
      contractEntity,
    );
    const contractEntity2 = new ContractEntity(
      '0x0000000000000000000000000000000000000009',
      EntityType.StakeProgresseds,
      new BigNumber(9),
      createdAt,
    );
    await config.repos.contractEntityRepository.save(contractEntity2);

    console.log("first response :- ", await config.repos.contractEntityRepository.get(contractEntity.contractAddress, contractEntity.entityType));
    console.log("---------------------------------------------------------------------------");
    console.log("second response :- ", await config.repos.contractEntityRepository.get(contractEntity2.contractAddress, contractEntity2.entityType));
    // Util.assertion(saveResponse, contractEntity);
  });

  // it('should pass when updating contract entity model', async (): Promise<void> => {
  //   const contractEntity = new ContractEntity(
  //     '0x0000000000000000000000000000000000000002',
  //     EntityType.StakeProgresseds,
  //     new BigNumber(1),
  //     createdAt,
  //   );
  //
  //   await config.repos.contractEntityRepository.save(
  //     contractEntity,
  //   );
  //
  //   contractEntity.timestamp = new BigNumber(3);
  //
  //   const updateResponse = await config.repos.contractEntityRepository.save(
  //     contractEntity,
  //   );
  //
  //   Util.assertion(updateResponse, contractEntity);
  // });
});
