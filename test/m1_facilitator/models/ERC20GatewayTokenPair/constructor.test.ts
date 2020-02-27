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

import { assertERC20GatewayTokenPairAttributes } from './util';
import ERC20GatewayTokenPair from '../../../../src/m1_facilitator/models/ERC20GatewayTokenPair';

describe('ERC20GatewayTokenPair::constructor', (): void => {
  it('checks correct construction of an ERC20GatewayTokenPair', async (): Promise<void> => {
    const erc20Gateway = '0xbb9bc244d798123fde783fcc1c72d3bb8c189411';
    const valueToken = '0xbb9bc244d798123fde783fcc1c72d3bb8c189412';
    const utilityToken = '0xbb9bc244d798123fde783fcc1c72d3bb8c189413';
    const createdAt = new Date();
    const updatedAt = new Date();

    const erc20GatewayTokenPair = new ERC20GatewayTokenPair(
      ERC20GatewayTokenPair.getGlobalAddress(erc20Gateway),
      valueToken,
      utilityToken,
      createdAt,
      updatedAt,
    );

    assertERC20GatewayTokenPairAttributes(
      erc20GatewayTokenPair,
      {
        erc20Gateway,
        valueToken,
        utilityToken,
        createdAt,
        updatedAt,
      },
    );
  });
});
