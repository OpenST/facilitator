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

import Database from '../../../src/models/Database';

import Util from './util';
import StubData from '../../utils/StubData';

import assert = require('assert');

interface TestConfigInterface {
  db: Database;
}
let config: TestConfigInterface;

describe('GatewayRepository::getAllByChain', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('should return all gateway by chain', async (): Promise<void> => {
    const chainId = '1234';
    const firstGateway = StubData.gatewayAttributes(chainId, '0x0000000000000000000000000000000000000002');
    await config.db.gatewayRepository.create(
      firstGateway,
    );

    const secondGateway = StubData.gatewayAttributes(chainId, '0x0000000000000000000000000000000000000003');
    await config.db.gatewayRepository.create(
      secondGateway,
    );

    const gateways = await config.db.gatewayRepository.getAllByChain(
      chainId,
    );

    assert.strictEqual(
      gateways.length,
      2,
      'It must return expected number of gateways',
    );

    Util.checkGatewayAgainstAttributes(
      gateways[0],
      firstGateway,
    );
    Util.checkGatewayAgainstAttributes(
      gateways[1],
      secondGateway,
    );
  });
});
