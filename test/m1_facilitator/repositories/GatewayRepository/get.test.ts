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
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';

describe('Gateway::get', (): void => {
  let config: {
    repos: Repositories;
  };
  let gateway: Gateway;
  let gatewayGA: string;
  let remoteGA: string;
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
    gatewayGA = '0x0000000000000000000000000000000000000001';
    remoteGA = '0x0000000000000000000000000000000000000002';
    gatewayType = GatewayType.CONSENSUS;
    destinationGA = '0x0000000000000000000000000000000000000003';
    remoteGatewayLastProvenBlockNumber = new BigNumber(100);
    anchorGA = '0x0000000000000000000000000000000000000004';
    createdAt = new Date();
    updatedAt = new Date();

    gateway = new Gateway(
      gatewayGA,
      remoteGA,
      gatewayType,
      anchorGA,
      destinationGA,
      remoteGatewayLastProvenBlockNumber,
      createdAt,
      updatedAt,
    );
    await config.repos.gatewayRepository.save(
      gateway,
    );
  });

  it('should pass when fetching Gateway model', async (): Promise<void> => {
    const getResponse = await config.repos.gatewayRepository.get(
      gateway.gatewayGA,
    );

    Util.assertGatewayAttributes(getResponse as Gateway, gateway);
  });

  it('should return null when querying for non-existing '
    + 'gateway global address', async (): Promise<void> => {
    const nonExistingGatewayGA = '0x0000000000000000000000000000000000000010';

    const getResponse = await config.repos.gatewayRepository.get(
      nonExistingGatewayGA,
    );

    assert.strictEqual(
      getResponse,
      null,
      "Gateway model doesn't exist.",
    );
  });
});
