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

import {
  GatewayAttributes,
  Gateway, GatewayConstant,
} from '../../../src/models/GatewayRepository';
import Database from '../../../src/models/Database';

import Util from './util';

import assert = require('assert');

interface TestConfigInterface {
  db: Database;
}
let config: TestConfigInterface;

describe('GatewayRepository::get', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Checks retrieval of an existing gateway.', async (): Promise<void> => {
    const gatewayAttributes: GatewayAttributes = {
      gatewayAddress: '0xe429143ac1bbe667473dfd060c7eee4c1e5ca96e',
      chainId: 1234,
      gatewayType: GatewayConstant.originGatewayType,
      remoteGatewayAddress: '0xd229143ac1bbe667473dfd060c7eee4c1e5ca96e',
      anchorAddress: '0xd419143ac1bbe667473dfd060c7eee4c1e5ca96e',
      tokenAddress: '0xd429043ac1bbe667473dfd060c7eee4c1e5ca96e',
      bounty: 1,
      activation: true,
    };

    await config.db.gatewayRepository.create(
      gatewayAttributes,
    );

    const gateway = await config.db.gatewayRepository.get(
      gatewayAttributes.gatewayAddress,
    );

    assert.notStrictEqual(
      gateway,
      null,
      'Gateway should exist as it has been just created.',
    );

    Util.checkGatewayAgainstAttributes(
      gateway as Gateway,
      gatewayAttributes,
    );
  });

  it('Checks retrieval of non-existing gateway.', async (): Promise<void> => {
    const nonExistingGatewayAddress = 'nonExistingGatewayAddress';
    const gateway = await config.db.gatewayRepository.get(
      nonExistingGatewayAddress,
    );

    assert.strictEqual(
      gateway,
      null,
      'Gateway  with \'nonExistingGatewayAddress\' does not exist.',
    );
  });
});
