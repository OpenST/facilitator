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
import * as Web3Utils from 'web3-utils';

import { interacts } from '@openst/mosaic-contracts';

import { Config } from '../../src/Config/Config';
import AuxiliaryChain from '../../src/models/AuxiliaryChain';
import ContractEntity, { EntityType } from '../../src/models/ContractEntity';
import Gateway from '../../src/models/Gateway';
import { GatewayType } from '../../src/repositories/GatewayRepository';
import Repositories from '../../src/repositories/Repositories';
import SeedData from '../../src/SeedData';
import AuxiliaryChainRepositoryUtil from '../repositories/AuxiliaryChainRepository/util';
import ContractEntityRepositoryUtil from '../repositories/ContractEntityRepository/util';
import GatewayRepositoryUtil from '../repositories/GatewayRepository/util';
import Utils from '../../src/Utils';

describe('SeedData.populateDb()', (): void => {
  let config: Config; let seedData: SeedData; let
    repositories: Repositories;
  let web3: Web3;

  const originChain = '12346';
  const auxiliaryChainId = 301;
  const zeroBn = new BigNumber('0');
  const ostComposerAddress = Web3Utils.toChecksumAddress('0x3c8ba8caecb60c67d69605a772ae1bb9a732fb38');
  const redeemPoolAddress = Web3Utils.toChecksumAddress('0x8bA9C19BeacBB3eF85E1Df57ceef1Df922F2D87F');
  const ostGatewayAddress = '0x97BA58DBE58898F2B669C56496f46F638DC322d4';
  const ostCoGatewayAddress = '0x40ce8B8EDEb678ea3aD1c9628924C903f8d04227';
  const anchorAddress = '0xaC80704c80AB83512b48314bDfa82f79923C2Fbe';
  const coAnchorAddress = '0xBe26124167E8a350eE806B3ba11Ddb6c8E6dc689';
  const simpleTokenAddress = '0x325f05a75999347b7d8461BaEf274afAE0B8AE1c';
  const ostPrimeAddress = '0x0d3E57044B1B96a257fB2ba3958c1130219A2d55';
  const currentTimestamp = Utils.getCurrentTimestamp();

  /**
   * Verifies data which was inserted in auxiliary_chains table.
   */
  async function verifyDataInAuxiliaryChainsTable(): Promise<void> {
    const auxiliaryChain = new AuxiliaryChain(
      auxiliaryChainId,
      originChain,
      ostGatewayAddress,
      ostCoGatewayAddress,
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
      ostGatewayAddress,
      originChain,
      GatewayType.Origin,
      ostCoGatewayAddress,
      simpleTokenAddress,
      anchorAddress,
      zeroBn,
      zeroBn,
      true,
    );
    const gatewayFromDb = await repositories.gatewayRepository.get(ostGatewayAddress);
    GatewayRepositoryUtil.assertGatewayAttributes(gateway, gatewayFromDb as Gateway);
  }

  /**
   * Verifies data which was inserted for CoGateway in gateways table.
   */
  async function verifyCoGatewayData(): Promise<void> {
    const gateway = new Gateway(
      ostCoGatewayAddress,
      auxiliaryChainId.toString(),
      GatewayType.Auxiliary,
      ostGatewayAddress,
      ostPrimeAddress,
      coAnchorAddress,
      zeroBn,
      zeroBn,
    );
    const gatewayFromDb = await repositories.gatewayRepository.get(ostCoGatewayAddress);
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
   * Verifies data which was inserted for OstComposer related events in contract_entities table.
   */
  async function verifyOstComposerRelatedContractEntities(): Promise<void> {
    const contractEntity = new ContractEntity(
      ostComposerAddress,
      EntityType.StakeRequesteds,
      currentTimestamp,
    );
    const contractEntityFromDb = await repositories.contractEntityRepository.get(
      ostComposerAddress,
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
        ostGatewayAddress,
        eventTypes[i],
        currentTimestamp,
      );
      const promise = repositories.contractEntityRepository.get(
        ostGatewayAddress,
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
        ostCoGatewayAddress,
        eventTypes[i],
        currentTimestamp,
      );
      const promise = repositories.contractEntityRepository.get(
        ostCoGatewayAddress,
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
    await verifyOstComposerRelatedContractEntities();
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
    const mosaicConfigPath = 'test/Facilitator/testdata/mosaic-config.json';
    const facilitatorConfigPath = 'test/FacilitatorConfig/testdata/facilitator-config.json';
    config = Config.fromFile(mosaicConfigPath, facilitatorConfigPath);
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
