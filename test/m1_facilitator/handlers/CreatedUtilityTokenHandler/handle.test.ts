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

import Gateway, { GatewayType } from '../../../../src/m1_facilitator/models/Gateway';
import CreatedUtilityTokenHandler from '../../../../src/m1_facilitator/handlers/CreatedUtilityTokenHandler';
import GatewayRepository from '../../../../src/m1_facilitator/repositories/GatewayRepository';
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';
import ERC20GatewayTokenPairRepository from '../../../../src/m1_facilitator/repositories/ERC20GatewayTokenPairRepository';
import assert from '../../../test_utils/assert';

describe('CreatedUtilityTokenHandler:handle', async (): Promise<void> => {
  const records = [{
    valueTokenAddress: '0x0000000000000000000000000000000000000040',
    utilityTokenAddress: '0x0000000000000000000000000000000000000041',
    contractAddress: '0x0000000000000000000000000000000000000042',
  },
  {
    valueTokenAddress: '0x0000000000000000000000000000000000000090',
    utilityTokenAddress: '0x0000000000000000000000000000000000000091',
    contractAddress: '0x0000000000000000000000000000000000000092',
  }];

  let gateway: Gateway;
  let createdUtilityTokenHandler: CreatedUtilityTokenHandler;
  let gatewayRepository: GatewayRepository;
  let erc20GatewayTokenPairRepository: ERC20GatewayTokenPairRepository;
  const gatewayAddress1 = '0x0000000000000000000000000000000000000002';
  const gatewayAddress2 = '0x0000000000000000000000000000000000000080';

  before(async (): Promise<void> => {
    const repositories = await Repositories.create();
    ({ erc20GatewayTokenPairRepository, gatewayRepository } = repositories);
    gateway = new Gateway(
      Gateway.getGlobalAddress(records[0].contractAddress),
      gatewayAddress1,
      GatewayType.ERC20,
      '0x0000000000000000000000000000000000000003',
      new BigNumber(200),
      '0x0000000000000000000000000000000000000003',
    );

    await gatewayRepository.save(gateway);

    createdUtilityTokenHandler = new CreatedUtilityTokenHandler(
      erc20GatewayTokenPairRepository,
      gatewayRepository,
    );
  });

  async function assertERC20GatewayPair(record: {
    gatewayGA: string;
    valueTokenAddress: string;
    utilityTokenAddress: string;
  }): Promise<void> {
    const erc20GatewayPair = await erc20GatewayTokenPairRepository.get(
      record.gatewayGA,
      record.valueTokenAddress,
    );

    assert.strictEqual(
      erc20GatewayPair && erc20GatewayPair.utilityToken,
      record.utilityTokenAddress,
      'Incorrect utility token address',
    );
  }

  it('should create record in ERC20GatewayTokenPair if value token for the gateway is '
  + 'not present', async (): Promise<void> => {
    await createdUtilityTokenHandler.handle([records[0]]);

    await assertERC20GatewayPair(
      {
        gatewayGA: Gateway.getGlobalAddress(gatewayAddress1),
        valueTokenAddress: records[0].valueTokenAddress,
        utilityTokenAddress: records[0].utilityTokenAddress,
      },
    );
  });

  it('should handle multiple records', async (): Promise<void> => {
    const gateway2 = new Gateway(
      Gateway.getGlobalAddress(records[1].contractAddress),
      gatewayAddress2,
      GatewayType.ERC20,
      '0x0000000000000000000000000000000000000003',
      new BigNumber(200),
      '0x0000000000000000000000000000000000000003',
    );
    await gatewayRepository.save(gateway2);

    await createdUtilityTokenHandler.handle([records[0], records[1]]);

    await assertERC20GatewayPair(
      {
        gatewayGA: Gateway.getGlobalAddress(gatewayAddress1),
        valueTokenAddress: records[0].valueTokenAddress,
        utilityTokenAddress: records[0].utilityTokenAddress,
      },
    );

    await assertERC20GatewayPair(
      {
        gatewayGA: Gateway.getGlobalAddress(gatewayAddress2),
        valueTokenAddress: records[1].valueTokenAddress,
        utilityTokenAddress: records[1].utilityTokenAddress,
      },
    );
  });
});
