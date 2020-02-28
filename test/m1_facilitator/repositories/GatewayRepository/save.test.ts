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
import { assertErrorMessages } from '../../../test_utils/assert';
import Gateway, { GatewayType } from '../../../../src/m1_facilitator/models/Gateway';
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';

describe('Gateway::save', (): void => {
  let config: {
    repos: Repositories;
  };
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
    gatewayGA = Gateway.getGlobalAddress('0x0000000000000000000000000000000000000001');
    remoteGA = Gateway.getGlobalAddress('0x0000000000000000000000000000000000000002');
    gatewayType = GatewayType.CONSENSUS;
    destinationGA = '0x0000000000000000000000000000000000000003';
    remoteGatewayLastProvenBlockNumber = new BigNumber(100);
    anchorGA = '0x0000000000000000000000000000000000000004';
    createdAt = new Date();
    updatedAt = new Date();
  });

  it('should create Gateway model correctly', async (): Promise<void> => {
    const gateway = new Gateway(
      gatewayGA,
      remoteGA,
      gatewayType,
      anchorGA,
      remoteGatewayLastProvenBlockNumber,
      destinationGA,
      createdAt,
      updatedAt,
    );
    const createdGateway = await config.repos.gatewayRepository.save(
      gateway,
    );

    Util.assertGatewayAttributes(createdGateway, gateway);
  });

  it('should update Gateway model correctly', async (): Promise<void> => {
    const gateway = new Gateway(
      gatewayGA,
      remoteGA,
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

    gateway.gatewayType = GatewayType.ERC20;
    gateway.destinationGA = '0x0000000000000000000000000000000000000040';
    gateway.remoteGatewayLastProvenBlockNumber = new BigNumber(200);
    gateway.anchorGA = '0x0000000000000000000000000000000000000041';
    gateway.remoteGA = '0x0000000000000000000000000000000000000042';

    const updatedGateway = await config.repos.gatewayRepository.save(
      gateway,
    );

    Util.assertGatewayAttributes(updatedGateway, gateway);
  });

  it('should fail when remote, anchor and destination global address'
   + 'is not valid', async (): Promise<void> => {
    const gateway = new Gateway(
      gatewayGA,
      '0x342',
      gatewayType,
      '0x123',
      remoteGatewayLastProvenBlockNumber,
      '0x1234',
      createdAt,
      updatedAt,
    );

    try {
      await config.repos.gatewayRepository.save(gateway);
    } catch (error) {
      assertErrorMessages(error.errors, [
        'Validation len on remoteGA failed',
        'Validation len on anchorGA failed',
        'Validation len on destinationGA failed',
      ]);
    }
  });
});
