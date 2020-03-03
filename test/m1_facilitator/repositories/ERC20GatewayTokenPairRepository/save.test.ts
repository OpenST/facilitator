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

import 'mocha';
import { InitOptions, Sequelize } from 'sequelize';

import { assertERC20GatewayTokenPairAttributes } from '../../models/ERC20GatewayTokenPair/util';
import assert from '../../../test_utils/assert';
import ERC20GatewayTokenPair from '../../../../src/m1_facilitator/models/ERC20GatewayTokenPair';
import ERC20GatewayTokenPairRepository from '../../../../src/m1_facilitator/repositories/ERC20GatewayTokenPairRepository';
import Gateway from '../../../../src/m1_facilitator/models/Gateway';

interface TestConfiguration {
  erc20GatewayTokenPairRepository: ERC20GatewayTokenPairRepository;
}
let config: TestConfiguration;

describe('ERC20GatewayTokenPairRepository::save', (): void => {
  beforeEach(async (): Promise<void> => {
    const sequelize = new Sequelize('sqlite::memory:', { logging: false });

    const initOptions: InitOptions = {
      sequelize,
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    };

    config = {
      erc20GatewayTokenPairRepository: new ERC20GatewayTokenPairRepository(initOptions),
    };

    await sequelize.sync();
  });

  it('checks "insert" of an erc20GatewayTokenPair', async (): Promise<void> => {
    const erc20Gateway = '0xbb9bc244d798123fde783fcc1c72d3bb8c189411';
    const valueToken = '0xbb9bc244d798123fde783fcc1c72d3bb8c189412';
    const utilityToken = '0xbb9bc244d798123fde783fcc1c72d3bb8c189413';

    const erc20GatewayTokenPair = new ERC20GatewayTokenPair(
      Gateway.getGlobalAddress(erc20Gateway),
      valueToken,
      utilityToken,
    );

    const returnedObject = await config.erc20GatewayTokenPairRepository.save(
      erc20GatewayTokenPair,
    );

    assertERC20GatewayTokenPairAttributes(
      returnedObject,
      {
        gatewayGA: Gateway.getGlobalAddress(erc20Gateway),
        valueToken,
        utilityToken,
      },
    );

    const storedObject = await config.erc20GatewayTokenPairRepository.get(
      Gateway.getGlobalAddress(erc20Gateway),
      valueToken,
    );
    assert(storedObject !== null);

    assertERC20GatewayTokenPairAttributes(
      storedObject as ERC20GatewayTokenPair,
      {
        gatewayGA: Gateway.getGlobalAddress(erc20Gateway),
        valueToken,
        utilityToken,
      },
    );
  });

  it('checks "update" of an erc20GatewayTokenPair', async (): Promise<void> => {
    const erc20Gateway = '0xbb9bc244d798123fde783fcc1c72d3bb8c189411';
    const valueToken = '0xbb9bc244d798123fde783fcc1c72d3bb8c189412';
    const utilityToken = '0xbb9bc244d798123fde783fcc1c72d3bb8c189413';

    const erc20GatewayTokenPair = new ERC20GatewayTokenPair(
      Gateway.getGlobalAddress(erc20Gateway),
      valueToken,
      utilityToken,
    );

    await config.erc20GatewayTokenPairRepository.save(
      erc20GatewayTokenPair,
    );

    const updatedUtilityToken = '0xbb9bc244d798123fde783fcc1c72d3bb8c189414';
    const updatedERC20GatewayTokenPair = new ERC20GatewayTokenPair(
      Gateway.getGlobalAddress(erc20Gateway),
      valueToken,
      updatedUtilityToken,
    );

    const returnedObject = await config.erc20GatewayTokenPairRepository.save(
      updatedERC20GatewayTokenPair,
    );

    assertERC20GatewayTokenPairAttributes(
      returnedObject,
      {
        gatewayGA: Gateway.getGlobalAddress(erc20Gateway),
        valueToken,
        utilityToken: updatedUtilityToken,
      },
    );

    const storedObject = await config.erc20GatewayTokenPairRepository.get(
      Gateway.getGlobalAddress(erc20Gateway),
      valueToken,
    );
    assert(storedObject !== null);

    assertERC20GatewayTokenPairAttributes(
      storedObject as ERC20GatewayTokenPair,
      {
        gatewayGA: Gateway.getGlobalAddress(erc20Gateway),
        valueToken,
        utilityToken: updatedUtilityToken,
      },
    );
  });
});
