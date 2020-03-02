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

import BigNumber from 'bignumber.js';

import assert from '../test_utils/assert';
import Gateway, { GatewayType } from '../../src/m1_facilitator/models/Gateway';
import Repositories from '../../src/m1_facilitator/repositories/Repositories';
import SeedDataInitializer from '../../src/m1_facilitator/SeedDataInitializer';

describe('SeedDataInitializer::isValidSeedData', (): void => {
  let config: {
    repos: Repositories;
  };
  let gatewayAddress: string;
  let remoteGatewayAddress: string;
  let gatewayType: GatewayType;
  let destinationGA: string;
  let remoteGatewayLastProvenBlockNumber: BigNumber;
  let anchorGA: string;
  let createdAt: Date;
  let updatedAt: Date;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    gatewayAddress = '0x0000000000000000000000000000000000000001';
    remoteGatewayAddress = '0x0000000000000000000000000000000000000002';
    gatewayType = GatewayType.ERC20;
    destinationGA = '0x0000000000000000000000000000000000000003';
    remoteGatewayLastProvenBlockNumber = new BigNumber(100);
    anchorGA = '0x0000000000000000000000000000000000000004';
    createdAt = new Date();
    updatedAt = new Date();
  });

  it('Should verify the seed data for given gateway address', async (): Promise<void> => {
    const gateway = new Gateway(
      Gateway.getGlobalAddress(gatewayAddress),
      Gateway.getGlobalAddress(remoteGatewayAddress),
      gatewayType,
      anchorGA,
      remoteGatewayLastProvenBlockNumber,
      destinationGA,
      createdAt,
      updatedAt,
    );

    await config.repos.gatewayRepository.save(
      gateway,
    );

    const seedDataInitialiser = new SeedDataInitializer(
      config.repos,
    );

    assert.strictEqual(
      await seedDataInitialiser.isValidSeedData(gatewayAddress),
      true,
      `Seed data validation failed for ${gatewayAddress}`,
    );
  });
});
