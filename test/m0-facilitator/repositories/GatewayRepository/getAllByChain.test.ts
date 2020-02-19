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

import Repositories from '../../../../src/m0-facilitator/repositories/Repositories';
import assert from '../../../test_utils/assert';
import StubData from '../../../test_utils/StubData';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('GatewayRepository::getAllByChain', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('should return all gateway by chain', async (): Promise<void> => {
    const chainId = '1234';
    const firstGateway = StubData.gatewayRecord(chainId, '0x0000000000000000000000000000000000000002');
    await config.repos.gatewayRepository.save(
      firstGateway,
    );

    const secondGateway = StubData.gatewayRecord(chainId, '0x0000000000000000000000000000000000000003');
    await config.repos.gatewayRepository.save(
      secondGateway,
    );

    const gateways = await config.repos.gatewayRepository.getAllByChain(
      chainId,
    );

    assert.strictEqual(
      gateways.length,
      2,
      'It must return expected number of gateways',
    );

    Util.assertGatewayAttributes(
      gateways[0],
      firstGateway,
    );
    Util.assertGatewayAttributes(
      gateways[1],
      secondGateway,
    );
  });
});
