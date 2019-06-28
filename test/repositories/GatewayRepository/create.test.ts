// /<reference path="util.ts"/>
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

import 'mocha';
import BigNumber from 'bignumber.js';

import {
  GatewayAttributes,
  Gateway,
  GatewayType,
} from '../../../src/repositories/GatewayRepository';

import Database from '../../../src/repositories/Database';

import Util from './util';

import assert from '../../utils/assert';

interface TestConfigInterface {
  db: Database;
}
let config: TestConfigInterface;

describe('GatewayRepository::create', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Checks creation of gateway model.', async (): Promise<void> => {
    const gatewayAttributes: GatewayAttributes = {
      gatewayAddress: '0x0000000000000000000000000000000000000001',
      chainId: 123,
      gatewayType: GatewayType.Origin,
      remoteGatewayAddress: '0x0000000000000000000000000000000000000002',
      anchorAddress: '0x0000000000000000000000000000000000000003',
      tokenAddress: '0x0000000000000000000000000000000000000004',
      bounty: new BigNumber('1'),
      activation: true,
    };

    const createResponse = await config.db.gatewayRepository.create(
      gatewayAttributes,
    );

    Util.checkGatewayAgainstAttributes(createResponse, gatewayAttributes);

    const gateway = await config.db.gatewayRepository.get(
      gatewayAttributes.gatewayAddress,
    );

    assert.notStrictEqual(
      gateway,
      null,
      'Newly created gateway does not exist.',
    );

    Util.checkGatewayAgainstAttributes(
      gateway as Gateway,
      gatewayAttributes,
    );
  });

  it('Throws if a gateway '
    + 'with the same gateway address already exists.', async (): Promise<void> => {
    const gatewayAttributesA: GatewayAttributes = {
      gatewayAddress: '0x0000000000000000000000000000000000000001',
      chainId: 123,
      gatewayType: GatewayType.Origin,
      remoteGatewayAddress: '0x0000000000000000000000000000000000000002',
      anchorAddress: '0x0000000000000000000000000000000000000003',
      tokenAddress: '0x0000000000000000000000000000000000000004',
      bounty: new BigNumber('1'),
      activation: true,
    };

    // All members, except gatewayAddress are different from gatewayAttributesA.
    const gatewayAttributesB: GatewayAttributes = {
      gatewayAddress: '0x0000000000000000000000000000000000000001',
      chainId: 1234,
      gatewayType: GatewayType.Auxiliary,
      remoteGatewayAddress: '0x0000000000000000000000000000000000000005',
      anchorAddress: '0x0000000000000000000000000000000000000006',
      tokenAddress: '0x0000000000000000000000000000000000000007',
      bounty: new BigNumber('2'),
      activation: false,
    };

    await config.db.gatewayRepository.create(
      gatewayAttributesA,
    );

    return assert.isRejected(
      config.db.gatewayRepository.create(
        gatewayAttributesB,
      ),
      /^Failed to create a gateway*/,
      'Creation should fail as a gateway with the same gateway address already exists.',
    );
  });
});
