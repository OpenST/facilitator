import * as sinon from 'sinon';
import SeedData from "../../src/SeedData";
import {Config} from "../../src/Config/Config";
import Repositories from "../../src/repositories/Repositories";
import BigNumber from "bignumber.js";
import AuxiliaryChain from "../../src/models/AuxiliaryChain";
import Gateway from "../../src/models/Gateway";
import {GatewayType} from "../../src/repositories/GatewayRepository";
import { interacts } from '@openst/mosaic-contracts';
import AuxiliaryChainRepositoryUtil from "../repositories/AuxiliaryChainRepository/util";
import GatewayRepositoryUtil from "../repositories/GatewayRepository/util";
import ContractEntityRepositoryUtil from "../repositories/ContractEntityRepository/util";
import ContractEntity, { EntityType } from "../../src/models/ContractEntity";

const Web3 = require('web3');

describe('SeedData.populateDb()', () => {

  let config: Config, seedData: SeedData, repositories: Repositories;
  let web3: any;

  const originChain = '12346';
  const auxiliaryChainId = 301;
  const zeroBn = new BigNumber('0');
  const ostComposerAddress = '0x3c8ba8caecb60c67d69605a772ae1bb9a732fb38';
  const ostGatewayAddress = '0x97BA58DBE58898F2B669C56496f46F638DC322d4';
  const ostCoGatewayAddress = '0x40ce8B8EDEb678ea3aD1c9628924C903f8d04227';
  const anchorAddress = '0xaC80704c80AB83512b48314bDfa82f79923C2Fbe';
  const coAnchorAddress = '0xBe26124167E8a350eE806B3ba11Ddb6c8E6dc689';
  const simpleTokenAddress = '0x325f05a75999347b7d8461BaEf274afAE0B8AE1c';
  const ostPrimeAddress = '0x0d3E57044B1B96a257fB2ba3958c1130219A2d55';
  
  beforeEach(async (): Promise<void> => {
    web3 = new Web3();
    const eip20GatewayMockObject = {
      methods: {
        activated: sinon.fake.returns({call: () => Promise.resolve(true)}),
        bounty: sinon.fake.returns({call: () => Promise.resolve(new BigNumber(10))}),
      }
    };
    sinon.replace(
      interacts,
      "getEIP20Gateway",
      function () {
        return eip20GatewayMockObject as any
      },
    );
    const eip20CoGatewayMockObject = {
      methods: {
        bounty: sinon.fake.returns({call: () => Promise.resolve(new BigNumber(10))}),
      }
    };
    sinon.replace(
      interacts,
      "getEIP20CoGateway",
      function () {
        return eip20CoGatewayMockObject as any
      },
    );
    const mosaicConfigPath = 'test/Facilitator/testdata/mosaic-config.json';
    const facilitatorConfigPath = 'test/FacilitatorConfig/testdata/facilitator-config.json';
    config = Config.fromFile(mosaicConfigPath, facilitatorConfigPath);
    sinon.replaceGetter(
      config,
      'originWeb3',
      function () {
        return web3;
      }
    );
    sinon.replaceGetter(
      config,
      'auxiliaryWeb3',
      function () {
        return web3;
      }
    );
    repositories = await Repositories.create();
    seedData = new SeedData(
      config,
      repositories.gatewayRepository,
      repositories.auxiliaryChainRepository,
      repositories.contractEntityRepository
    );
    await seedData.populateDb();
  });

  it('should create entry in auxiliary_chains table', async () => {
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
    AuxiliaryChainRepositoryUtil.assertAuxiliaryChainAttributes(auxiliaryChain, auxiliaryChainFromDb as AuxiliaryChain);
    sinon.restore();
  });

  it('should create entry for Gateway contract in gateways table', async () => {
    const gateway = new Gateway(
      ostGatewayAddress,
      originChain,
      GatewayType.Origin,
      ostCoGatewayAddress,
      simpleTokenAddress,
      anchorAddress,
      zeroBn,
      true,
    );
    const gatewayFromDb = await repositories.gatewayRepository.get(ostGatewayAddress);
    GatewayRepositoryUtil.assertGatewayAttributes(gateway, gatewayFromDb as Gateway);
    sinon.restore();
  });

  it('should create entry for CoGateway contract in gateways table', async () => {
    const gateway = new Gateway(
      ostCoGatewayAddress,
      auxiliaryChainId.toString(),
      GatewayType.Auxiliary,
      ostGatewayAddress,
      ostPrimeAddress,
      coAnchorAddress,
      zeroBn,
      undefined,
    );
    const gatewayFromDb = await repositories.gatewayRepository.get(ostCoGatewayAddress);
    GatewayRepositoryUtil.assertGatewayAttributes(gateway, gatewayFromDb as Gateway);
    sinon.restore();
  });

  it('should create entry for all entities related to ostComposer in contract_entities table', async () => {
    const contractEntity = new ContractEntity(
      ostComposerAddress,
      EntityType.StakeRequesteds,
      zeroBn
    );
    const contractEntityFromDb = await repositories.contractEntityRepository.get(
      ostComposerAddress,
      EntityType.StakeRequesteds,
      );
    ContractEntityRepositoryUtil.assertion(contractEntity, contractEntityFromDb as ContractEntity);
    sinon.restore();
  });

  it('should create entry for all entities related to gateway in contract_entities table', async () => {
    const eventTypes = [
      EntityType.StakeIntentDeclareds,
      EntityType.StakeProgresseds,
    ];
    for(let i=0; i<eventTypes.length; i++) {
      const contractEntity = new ContractEntity(
        ostGatewayAddress,
        eventTypes[i],
        zeroBn
      );
      const contractEntityFromDb = await repositories.contractEntityRepository.get(
        ostGatewayAddress,
        eventTypes[i],
        );
      ContractEntityRepositoryUtil.assertion(contractEntity, contractEntityFromDb as ContractEntity);
    }
    sinon.restore();
  });

  it('should create entry for all entities related to auxiliary anchor in contract_entities table', async () => {
    const contractEntity = new ContractEntity(
      coAnchorAddress,
      EntityType.StateRootAvailables,
      zeroBn
    );
    const contractEntityFromDb = await repositories.contractEntityRepository.get(
      coAnchorAddress,
      EntityType.StateRootAvailables,
    );
    ContractEntityRepositoryUtil.assertion(contractEntity, contractEntityFromDb as ContractEntity);
    sinon.restore();
  });

  it('should create entry for all entities related to coGateway in contract_entities table', async () => {
    const eventTypes = [
      EntityType.StakeIntentConfirmeds,
      EntityType.MintProgresseds,
      EntityType.GatewayProvens,
    ];
    for(let i=0; i<eventTypes.length; i++) {
      const contractEntity = new ContractEntity(
        ostCoGatewayAddress,
        eventTypes[i],
        zeroBn
      );
      const contractEntityFromDb = await repositories.contractEntityRepository.get(
        ostCoGatewayAddress,
        eventTypes[i],
      );
      ContractEntityRepositoryUtil.assertion(contractEntity, contractEntityFromDb as ContractEntity);
    }
    sinon.restore();
  });
});
