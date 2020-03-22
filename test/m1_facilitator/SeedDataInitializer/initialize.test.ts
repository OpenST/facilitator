// Copyright 2020 OpenST Ltd.
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

import Web3 from 'web3';
import sinon from 'sinon';
import Mosaic from 'Mosaic';
import { interacts } from '@openst/mosaic-contracts';

import BigNumber from 'bignumber.js';
import Repositories
  from '../../../src/m1_facilitator/repositories/Repositories';
import SeedDataInitializer
  from '../../../src/m1_facilitator/SeedDataInitializer';
import Gateway, { GatewayType } from '../../../src/m1_facilitator/models/Gateway';
import Anchor from '../../../src/m1_facilitator/models/Anchor';
import assert from '../../test_utils/assert';
import ContractEntityRepository
  from '../../../src/common/repositories/ContractEntityRepository';
import { EntityType } from '../../../src/common/models/ContractEntity';
import Utils from '../../../src/common/Utils';
import { ArchitectureLayout } from '../../../src/m1_facilitator/manifest/Manifest';

function assertGateway(
  gateway: Gateway | null,
  gatewayAddress: string,
  cogatewayAddress: string,
  originAnchorAddress: string,
): void {
  assert.strictEqual(
    gateway && gateway.gatewayGA,
    Gateway.getGlobalAddress(gatewayAddress),
    'Gateway GA must match',
  );
  assert.strictEqual(
    gateway && gateway.remoteGA,
    Gateway.getGlobalAddress(cogatewayAddress),
    'Remote GA must match',
  );
  assert.strictEqual(
    gateway && gateway.anchorGA,
    Anchor.getGlobalAddress(originAnchorAddress),
    'Anchor GA must match',
  );
  assert.strictEqual(
    gateway && gateway.gatewayType,
    GatewayType.ERC20,
    'Gateway type must match',
  );
  assert.isOk(
    gateway && gateway.remoteGatewayLastProvenBlockNumber.eq(new BigNumber(0)),
    'remoteGatewayLastProvenBlockNumber must be zero',
  );
  assert.isOk(
    gateway && gateway.destinationGA === null,
    'Destination GA must be null',
  );
}

function assertAnchor(
  anchor: Anchor | null,
  originAnchorAddress: string,
  latestAnchorBlockHeight: string,
): void {
  assert.strictEqual(
    anchor && anchor.anchorGA,
    Anchor.getGlobalAddress(originAnchorAddress),
    'Anchor GA must match',
  );

  assert.isOk(
    anchor
    && anchor.lastAnchoredBlockNumber.isEqualTo(new BigNumber(latestAnchorBlockHeight)),
    'Anchor last anchor block number must match',
  );
}

async function assertContractEntity(
  contractEntityRepository: ContractEntityRepository,
  entityType: EntityType,
  contractAddress: string,
): Promise<void> {
  const contractEntity = await contractEntityRepository.get(
    contractAddress,
    entityType,
  );
  assert.isOk(
    contractEntity !== null,
    `Contract entity ${entityType} must exist`,
  );
}

async function assertContractEntities(
  contractEntityRepository: ContractEntityRepository,
  gatewayAddress: string,
  cogatewayAddress: string,
  originAnchorAddress: string,
  auxiliaryAnchorAddress: string,
): Promise<void> {
  await assertContractEntity(
    contractEntityRepository,
    EntityType.ProvenGateways,
    gatewayAddress,
  );
  await assertContractEntity(
    contractEntityRepository,
    EntityType.ProvenGateways,
    cogatewayAddress,
  );
  await assertContractEntity(
    contractEntityRepository,
    EntityType.AvailableStateRoots,
    originAnchorAddress,
  );
  await assertContractEntity(
    contractEntityRepository,
    EntityType.AvailableStateRoots,
    auxiliaryAnchorAddress,
  );
  await assertContractEntity(
    contractEntityRepository,
    EntityType.DeclaredDepositIntents,
    gatewayAddress,
  );
  await assertContractEntity(
    contractEntityRepository,
    EntityType.ConfirmedDepositIntents,
    cogatewayAddress,
  );
  await assertContractEntity(
    contractEntityRepository,
    EntityType.CreatedUtilityTokens,
    cogatewayAddress,
  );
  await assertContractEntity(
    contractEntityRepository,
    EntityType.ConfirmedWithdrawIntents,
    gatewayAddress,
  );
  await assertContractEntity(
    contractEntityRepository,
    EntityType.DeclaredWithdrawIntents,
    cogatewayAddress,
  );
}

describe('SeedDataInitializer:initialize', () => {
  let repositories: Repositories;
  const originWeb3 = sinon.createStubInstance(Web3);
  const auxiliaryWeb3 = sinon.createStubInstance(Web3);
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const cogatewayAddress = '0x0000000000000000000000000000000000000002';
  const originAnchorAddress = '0x0000000000000000000000000000000000000003';
  const auxiliaryAnchorAddress = '0x0000000000000000000000000000000000000002';
  const latestAnchorBlockHeight = '0';
  const fakeERC20Gateway = {
    methods: {
      messageOutbox: () => ({
        call: async (): Promise<string> => Promise.resolve(cogatewayAddress),
      }),
      stateRootProvider: () => ({
        call: async (): Promise<string> => Promise.resolve(originAnchorAddress),
      }),
    },
  };
  const fakeERC20Cogateway = {
    methods: {
      stateRootProvider: () => ({
        call: async (): Promise<string> => Promise.resolve(auxiliaryAnchorAddress),
      }),
    },
  };
  const fakeAnchor = {
    methods: {
      getLatestStateRootBlockNumber: () => ({
        call: async (): Promise<string> => Promise.resolve(latestAnchorBlockHeight),
      }),
    },
  };

  const fakeAnchor_Gen0 = {
    methods: {
      getLatestStateRootBlockHeight: () => ({
        call: async (): Promise<string> => Promise.resolve(latestAnchorBlockHeight),
      }),
    },
  };

  beforeEach(async (): Promise<void> => {
    repositories = await Repositories.create();
  });

  it('should initialize seed data', async (): Promise<void> => {
    sinon.replace(
      Mosaic.interacts,
      'getERC20Gateway',
      sinon.fake.returns(fakeERC20Gateway),
    );

    sinon.replace(
      Mosaic.interacts,
      'getERC20Cogateway',
      sinon.fake.returns(fakeERC20Cogateway),
    );

    sinon.replace(
      Mosaic.interacts,
      'getAnchor',
      sinon.fake.returns(fakeAnchor),
    );

    sinon.replace(
      Utils,
      'latestBlockTimestamp',
      sinon.fake.resolves(new BigNumber(1)),
    );

    await new SeedDataInitializer(repositories).initialize(
      originWeb3,
      auxiliaryWeb3,
      gatewayAddress,
      ArchitectureLayout.MOSAIC_0_14_GEN_1,
    );

    const gateway = await repositories.gatewayRepository.get(
      Gateway.getGlobalAddress(gatewayAddress),
    );

    assertGateway(
      gateway,
      gatewayAddress,
      cogatewayAddress,
      originAnchorAddress,
    );

    const cogateway = await repositories.gatewayRepository.get(
      Gateway.getGlobalAddress(cogatewayAddress),
    );

    assertGateway(
      cogateway,
      cogatewayAddress,
      gatewayAddress,
      auxiliaryAnchorAddress,
    );

    const anchor = await repositories.anchorRepository.get(
      Anchor.getGlobalAddress(originAnchorAddress),
    );

    assertAnchor(anchor, originAnchorAddress, latestAnchorBlockHeight);

    const coAnchor = await repositories.anchorRepository.get(
      Anchor.getGlobalAddress(auxiliaryAnchorAddress),
    );

    assertAnchor(coAnchor, auxiliaryAnchorAddress, latestAnchorBlockHeight);

    await assertContractEntities(
      repositories.contractEntityRepository,
      gatewayAddress,
      cogatewayAddress,
      originAnchorAddress,
      auxiliaryAnchorAddress,
    );
  });

  it('should initialize seed data when facilitator is running on GEN0 testnet', async (): Promise<void> => {
    sinon.replace(
      Mosaic.interacts,
      'getERC20Gateway',
      sinon.fake.returns(fakeERC20Gateway),
    );

    sinon.replace(
      Mosaic.interacts,
      'getERC20Cogateway',
      sinon.fake.returns(fakeERC20Cogateway),
    );

    sinon.replace(
      interacts,
      'getAnchor',
      sinon.fake.returns(fakeAnchor_Gen0),
    );

    sinon.replace(
      Utils,
      'latestBlockTimestamp',
      sinon.fake.resolves(new BigNumber(1)),
    );

    await new SeedDataInitializer(repositories).initialize(
      originWeb3,
      auxiliaryWeb3,
      gatewayAddress,
      ArchitectureLayout.MOSAIC_0_14_GEN_0,
    );

    const gateway = await repositories.gatewayRepository.get(
      Gateway.getGlobalAddress(gatewayAddress),
    );

    assertGateway(
      gateway,
      gatewayAddress,
      cogatewayAddress,
      originAnchorAddress,
    );

    const cogateway = await repositories.gatewayRepository.get(
      Gateway.getGlobalAddress(cogatewayAddress),
    );

    assertGateway(
      cogateway,
      cogatewayAddress,
      gatewayAddress,
      auxiliaryAnchorAddress,
    );

    const anchor = await repositories.anchorRepository.get(
      Anchor.getGlobalAddress(originAnchorAddress),
    );

    assertAnchor(anchor, originAnchorAddress, latestAnchorBlockHeight);

    const coAnchor = await repositories.anchorRepository.get(
      Anchor.getGlobalAddress(auxiliaryAnchorAddress),
    );

    assertAnchor(coAnchor, auxiliaryAnchorAddress, latestAnchorBlockHeight);

    await assertContractEntities(
      repositories.contractEntityRepository,
      gatewayAddress,
      cogatewayAddress,
      originAnchorAddress,
      auxiliaryAnchorAddress,
    );
  });

  afterEach(async (): Promise<void> => {
    sinon.restore();
  });
});
