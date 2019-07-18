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

import Repositories from '../../../src/repositories/Repositories';
import assert from '../../test_utils/assert';
import StubData from '../../test_utils/StubData';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('MessageRepository::getGatewaysWithPendingOriginMessages', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('should fetch all pending messages of given gateways and given height.', async (): Promise<void> => {
    const expectedGatewayAddresses = ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'];
    await config.repos.messageRepository.save(
      StubData.messageAttributes(
        '0x000000000000000000000000000000000000000000000000000001',
        expectedGatewayAddresses[0],
        new BigNumber(1),
      ),
    );

    await config.repos.messageRepository.save(
      StubData.messageAttributes(
        '0x000000000000000000000000000000000000000000000000000002',
        expectedGatewayAddresses[0],
        new BigNumber(2),
      ),
    );


    await config.repos.messageRepository.save(
      StubData.messageAttributes(
        '0x000000000000000000000000000000000000000000000000000003',
        expectedGatewayAddresses[1],
        new BigNumber(1),
      ),
    );

    const gateways = await config.repos
      .messageRepository.getGatewaysWithPendingOriginMessages(
        expectedGatewayAddresses,
        new BigNumber(10),
      );

    assert.deepStrictEqual(
      expectedGatewayAddresses,
      gateways,
      'It must return gateway with pending messages',
    );
  });
});
