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
import sinon from 'sinon';
import Web3 from 'web3';

import { interacts } from '@openst/mosaic-contracts';

import { Config, ConfigType } from '../../../src/m0_facilitator/Config/Config';
import AuxiliaryChain from '../../../src/m0_facilitator/models/AuxiliaryChain';
import ContractEntity, { EntityType } from '../../../src/m0_facilitator/models/ContractEntity';
import Gateway from '../../../src/m0_facilitator/models/Gateway';
import { GatewayType } from '../../../src/m0_facilitator/repositories/GatewayRepository';
import Repositories from '../../../src/m0_facilitator/repositories/Repositories';
import SeedData from '../../../src/m0_facilitator/SeedData';
import AuxiliaryChainRepositoryUtil from '../repositories/AuxiliaryChainRepository/util';
import ContractEntityRepositoryUtil from '../repositories/ContractEntityRepository/util';
import GatewayRepositoryUtil from '../repositories/GatewayRepository/util';
import Utils from '../../../src/m0_facilitator/Utils';

describe('SeedData.populateDb()', (): void => {
  let config: Config; let seedData: SeedData; let
    repositories: Repositories;
  let web3: Web3;

  const originChain = 'dev-origin';
  const auxiliaryChainId = 1000;
  const zeroBn = new BigNumber('0');
  const stakePoolAddress = '0x34817AF7B685DBD8a360e8Bed3121eb03D56C9BD';
  const redeemPoolAddress = '0x8bA9C19BeacBB3eF85E1Df57ceef1Df922F2D87F';
  const eip20GatewayAddress = '0xA7f056b1320fE619571849f138Cd1Ae2f2e64179';
  const eip20CoGatewayAddress = '0xB6329BcFE2050F50db2eD347b3cE67DDfAc39110';
  const anchorAddress = '0xEa8D41fc6C6C0Ee155E5F6FbF9Cc1167Fa17927E';
  const coAnchorAddress = '0x50c0Af1A754CE6bA25a102D4ee759b08141C4aA9';
  const valueTokenAddress = '0x9AC77F4c0ca4D0F2142D7a77175cf4F1295fb2d8';
  const utilityTokenAddress = '0x19F64B29789F02FFcCE2c37DFB3d65FEaDdea66a';
  const currentTimestamp = Utils.getCurrentTimestamp();

  /**
   * Verifies data which was inserted in auxiliary_chains table.
   */
  async function verifyDataInAuxiliaryChainsTable(): Promise<void> {
    const auxiliaryChain = new AuxiliaryChain(
      auxiliaryChainId,
      originChain,
      eip20GatewayAddress,
      eip20CoGatewayAddress,
      anchorAddress,
      coAnchorAddress,
      zeroBn,
      zeroBn,
    );
    const auxiliaryChainFromDb = await repositories.auxiliaryChainRepository.get(auxiliaryChainId);
    AuxiliaryChainRepositoryUtil.assertAuxiliaryChainAttributes(
      auxiliaryChain,
      auxiliaryChainFromDb as AuxiliaryChain,
    );
  }

  /**
   * Verifies data which was inserted for Gateway in gateways table.
   */
  async function verifyGatewayData(): Promise<void> {
    const gateway = new Gateway(
      eip20GatewayAddress,
      originChain,
      GatewayType.Origin,
      eip20CoGatewayAddress,
      valueTokenAddress,
      anchorAddress,
      zeroBn,
      zeroBn,
      true,
    );
    const gatewayFromDb = await repositories.gatewayRepository.get(eip20GatewayAddress);
    GatewayRepositoryUtil.assertGatewayAttributes(gateway, gatewayFromDb as Gateway);
  }

  /**
   * Verifies data which was inserted for CoGateway in gateways table.
   */
  async function verifyCoGatewayData(): Promise<void> {
    const gateway = new Gateway(
      eip20CoGatewayAddress,
      auxiliaryChainId.toString(),
      GatewayType.Auxiliary,
      eip20GatewayAddress,
      utilityTokenAddress,
      coAnchorAddress,
      zeroBn,
      zeroBn,
    );
    const gatewayFromDb = await repositories.gatewayRepository.get(eip20CoGatewayAddress);
    GatewayRepositoryUtil.assertGatewayAttributes(gateway, gatewayFromDb as Gateway);
  }

  /**
   * Verifies data which was inserted in gateways table.
   */
  async function verifyDataInGatewaysTable(): Promise<void> {
    await verifyGatewayData();
    await verifyCoGatewayData();
  }

  /**
   * Verifies data which was inserted for StakePool related events in contract_entities table.
   */
  async function verifyStakePoolRelatedContractEntities(): Promise<void> {
    const contractEntity = new ContractEntity(
      stakePoolAddress,
      EntityType.StakeRequesteds,
      currentTimestamp,
    );
    const contractEntityFromDb = await repositories.contractEntityRepository.get(
      stakePoolAddress,
      EntityType.StakeRequesteds,
    );
    ContractEntityRepositoryUtil.assertion(contractEntity, contractEntityFromDb as ContractEntity);
  }

  /**
   * Verifies data which was inserted for RedeemPool related events in contract_entities table.
   */
  async function verifyRedeemPoolRelatedContractEntities(): Promise<void> {
    const contractEntity = new ContractEntity(
      redeemPoolAddress,
      EntityType.RedeemRequesteds,
      currentTimestamp,
    );
    const contractEntityFromDb = await repositories.contractEntityRepository.get(
      redeemPoolAddress,
      EntityType.RedeemRequesteds,
    );
    ContractEntityRepositoryUtil.assertion(contractEntity, contractEntityFromDb as ContractEntity);
  }

  /**
   * Verifies data which was inserted for Gateway related events in contract_entities table.
   */
  async function verifyGatewayRelatedContractEntities(): Promise<void> {
    const eventTypes = [
      EntityType.StakeIntentDeclareds,
      EntityType.StakeProgresseds,
      EntityType.RedeemIntentConfirmeds,
      EntityType.UnstakeProgresseds,
      EntityType.GatewayProvens,
    ];
    const promises = [];
    for (let i = 0; i < eventTypes.length; i += 1) {
      const contractEntity = new ContractEntity(
        eip20GatewayAddress,
        eventTypes[i],
        currentTimestamp,
      );
      const promise = repositories.contractEntityRepository.get(
        eip20GatewayAddress,
        eventTypes[i],
      ).then((contractEntityFromDb) => {
        ContractEntityRepositoryUtil.assertion(
          contractEntity,
          contractEntityFromDb as ContractEntity,
        );
      });
      promises.push(promise);
    }
    await Promise.all(promises);
  }

  /**
   * Verifies data which was inserted for Auxiliary Anchor related events in
   * contract_entities table.
   */
  async function verifyAuxiliaryAnchorRelatedContractEntities(): Promise<void> {
    const contractEntity = new ContractEntity(
      coAnchorAddress,
      EntityType.StateRootAvailables,
      currentTimestamp,
    );
    const contractEntityFromDb = await repositories.contractEntityRepository.get(
      coAnchorAddress,
      EntityType.StateRootAvailables,
    );
    ContractEntityRepositoryUtil.assertion(contractEntity, contractEntityFromDb as ContractEntity);
  }

  /**
   * Verifies data which was inserted for Origin Anchor related events in contract_entities table.
   */
  async function verifyOriginAnchorRelatedContractEntities(): Promise<void> {
    const contractEntity = new ContractEntity(
      anchorAddress,
      EntityType.StateRootAvailables,
      currentTimestamp,
    );
    const contractEntityFromDb = await repositories.contractEntityRepository.get(
      anchorAddress,
      EntityType.StateRootAvailables,
    );
    ContractEntityRepositoryUtil.assertion(contractEntity, contractEntityFromDb as ContractEntity);
  }

  /**
   * Verifies data which was inserted for CoGateway related events in contract_entities table.
   */
  async function verifyCoGatewayRelatedContractEntities(): Promise<void> {
    const eventTypes = [
      EntityType.StakeIntentConfirmeds,
      EntityType.MintProgresseds,
      EntityType.GatewayProvens,
      EntityType.RedeemIntentDeclareds,
      EntityType.RedeemProgresseds,
    ];
    const promises = [];
    for (let i = 0; i < eventTypes.length; i += 1) {
      const contractEntity = new ContractEntity(
        eip20CoGatewayAddress,
        eventTypes[i],
        currentTimestamp,
      );
      const promise = repositories.contractEntityRepository.get(
        eip20CoGatewayAddress,
        eventTypes[i],
      ).then((contractEntityFromDb) => {
        ContractEntityRepositoryUtil.assertion(
          contractEntity,
          contractEntityFromDb as ContractEntity,
        );
      });
      promises.push(promise);
    }
    await Promise.all(promises);
  }

  /**
   * Verifies data which was inserted in contract_entities table.
   */
  async function verifyDataInContractEntitiesTable(): Promise<void> {
    await verifyStakePoolRelatedContractEntities();
    await verifyRedeemPoolRelatedContractEntities();
    await verifyGatewayRelatedContractEntities();
    await verifyAuxiliaryAnchorRelatedContractEntities();
    await verifyOriginAnchorRelatedContractEntities();
    await verifyCoGatewayRelatedContractEntities();
  }

  beforeEach(async (): Promise<void> => {
    web3 = new Web3(null);
    const eip20GatewayMockObject = {
      methods: {
        activated: sinon.fake.returns({
          call:
            async (): Promise<boolean> => Promise.resolve(true),
        }),
        bounty: sinon.fake.returns(
          { call: async (): Promise<BigNumber> => Promise.resolve(new BigNumber(10)) },
        ),
      },
    };
    sinon.replace(
      interacts,
      'getEIP20Gateway',
      () => eip20GatewayMockObject as any,
    );
    const eip20CoGatewayMockObject = {
      methods: {
        bounty: sinon.fake.returns({ call: async () => Promise.resolve(new BigNumber(10)) }),
      },
    };
    sinon.replace(
      interacts,
      'getEIP20CoGateway',
      () => eip20CoGatewayMockObject as any,
    );
    const mosaicConfigPath = 'testdata/m0_facilitator/mosaic.json';
    const facilitatorConfigPath = 'test/m0_facilitator/FacilitatorConfig/testdata/facilitator-config.json';
    config = Config.fromFile(facilitatorConfigPath, mosaicConfigPath, ConfigType.MOSAIC);
    sinon.replaceGetter(
      config,
      'originWeb3',
      (): Web3 => web3,
    );

    sinon.replaceGetter(
      config,
      'auxiliaryWeb3',
      (): Web3 => web3,
    );

    repositories = await Repositories.create();
    seedData = new SeedData(
      config,
      repositories.gatewayRepository,
      repositories.auxiliaryChainRepository,
      repositories.contractEntityRepository,
      currentTimestamp,
    );
  });

  it('should verify data population in db tables', async (): Promise<void> => {
    await seedData.populateDb();
    await verifyDataInAuxiliaryChainsTable();
    await verifyDataInGatewaysTable();
    await verifyDataInContractEntitiesTable();
  });

  afterEach(async () => {
    sinon.restore();
  });
});
