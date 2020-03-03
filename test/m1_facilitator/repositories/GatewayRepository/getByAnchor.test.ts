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
//
// ----------------------------------------------------------------------------

import BigNumber from 'bignumber.js';

import Util from './util';
import assert from '../../../test_utils/assert';
import Gateway, { GatewayType } from '../../../../src/m1_facilitator/models/Gateway';
import Repositories
  from '../../../../src/m1_facilitator/repositories/Repositories';

describe('Gateway::getByAnchor', (): void => {
  let config: {
    repos: Repositories;
  };
  let gateway: Gateway;
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    gateway = new Gateway(
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000002',
      GatewayType.CONSENSUS,
      '0x0000000000000000000000000000000000000004',
      new BigNumber(100),
      '0x0000000000000000000000000000000000000003',
      new Date(),
      new Date(),
    );
    await config.repos.gatewayRepository.save(
      gateway,
    );
  });

  it('should pass when fetching Gateway model', async (): Promise<void> => {
    const getResponse = await config.repos.gatewayRepository.getByAnchor(
      gateway.anchorGA,
    );

    Util.assertGatewayAttributes(getResponse as Gateway, gateway);
  });

  it('should return null when querying for non-existing '
    + 'anchor global address', async (): Promise<void> => {
    const nonExistingAnchorGA = '0x0000000000000000000000000000000000000010';

    const getResponse = await config.repos.gatewayRepository.get(
      nonExistingAnchorGA,
    );

    assert.strictEqual(
      getResponse,
      null,
      "Gateway model doesn't exist.",
    );
  });
})
