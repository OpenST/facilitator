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

import Gateway from '../../../src/models/Gateway';
import { GatewayType } from '../../../src/repositories/GatewayRepository';
import Repositories from '../../../src/repositories/Repositories';
import Util from './util';
import assert, { assertErrorMessages } from "../../test_utils/assert";

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

describe('GatewayRepository::save', (): void => {
  let gatewayAddress: string;
  let chain: string;
  let gatewayType: string;
  let remoteGatewayAddress: string;
  let tokenAddress: string;
  let anchorAddress: string;
  let bounty: BigNumber;
  let activation: boolean;
  let lastRemoteGatewayProvenBlockHeight: BigNumber;
  let createdAt: Date;
  let updatedAt: Date;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    gatewayAddress = '0x0000000000000000000000000000000000000001';
    chain = '1';
    gatewayType = GatewayType.Auxiliary;
    remoteGatewayAddress = '0x0000000000000000000000000000000000000002';
    tokenAddress = '0x0000000000000000000000000000000000000003';
    anchorAddress = '0x0000000000000000000000000000000000000004';
    bounty = new BigNumber(100);
    activation = true;
    lastRemoteGatewayProvenBlockHeight = new BigNumber(1000);
    createdAt = new Date();
    updatedAt = new Date();
  });

  it('should pass when creating Gateway model.', async (): Promise<void> => {
    const gateway = new Gateway(
      gatewayAddress,
      chain,
      gatewayType,
      remoteGatewayAddress,
      tokenAddress,
      anchorAddress,
      bounty,
      activation,
      lastRemoteGatewayProvenBlockHeight,
      createdAt,
      updatedAt,
    );
    const createdGateway = await config.repos.gatewayRepository.save(
      gateway,
    );

    Util.assertGatewayAttributes(createdGateway, gateway);
  });

  it('should pass when updating Gateway model', async (): Promise<void> => {
    const gateway = new Gateway(
      gatewayAddress,
      chain,
      gatewayType,
      remoteGatewayAddress,
      tokenAddress,
      anchorAddress,
      bounty,
      activation,
      lastRemoteGatewayProvenBlockHeight,
      createdAt,
      updatedAt,
    );

    await config.repos.gatewayRepository.save(
      gateway,
    );

    gateway.lastRemoteGatewayProvenBlockHeight = new BigNumber(1001);

    const updatedGateway = await config.repos.gatewayRepository.save(
      gateway,
    );

    Util.assertGatewayAttributes(updatedGateway, gateway);
  });

  it('should fail when remote gateway address is null', async (): Promise<void> => {
    const invalidRemoteGatewayAddress = 'Gateway.remoteGatewayAddress cannot be null';
    const gateway = new Gateway(
      gatewayAddress,
      chain,
      gatewayType,
      null!,
      tokenAddress,
      anchorAddress,
      bounty,
      activation,
      lastRemoteGatewayProvenBlockHeight,
      createdAt,
      updatedAt,
    );

    assert.isRejected(
      config.repos.gatewayRepository.save(
      gateway,
    ),
      `${invalidRemoteGatewayAddress}`,
    );
  });

  it('should fail when remote gateway address is undefined', async (): Promise<void> => {
    const invalidRemoteGatewayAddress = 'Gateway.remoteGatewayAddress cannot be null';
    const gateway = new Gateway(
      gatewayAddress,
      chain,
      gatewayType,
      undefined,
      tokenAddress,
      anchorAddress,
      bounty,
      activation,
      lastRemoteGatewayProvenBlockHeight,
      createdAt,
      updatedAt,
    );

    assert.isRejected(
      config.repos.gatewayRepository.save(
      gateway,
    ),
      `${invalidRemoteGatewayAddress}`,
    );
  });

  it('should fail when parameters are undefined', async (): Promise<void> => {
    // It is used to test for multiple validations failure.

    const gateway = new Gateway(
      gatewayAddress,
      undefined!,
      undefined,
      undefined,
      '0x1234',
      '0x12345',
      undefined!,
      activation,
      lastRemoteGatewayProvenBlockHeight,
      createdAt,
      updatedAt,
    );

    assert.isRejected(
      config.repos.gatewayRepository.save(
        gateway,
      ),
    );

    try {
      await config.repos.gatewayRepository.save(gateway);
    } catch (error) {
      assertErrorMessages(error.errors, [
        'Gateway.chain cannot be null',
        'Gateway.gatewayType cannot be null',
        'Gateway.remoteGatewayAddress cannot be null',
        'Gateway.bounty cannot be null',
        'Validation len on tokenAddress failed',
        'Validation len on anchorAddress failed',
      ]);
    }
  });

});
