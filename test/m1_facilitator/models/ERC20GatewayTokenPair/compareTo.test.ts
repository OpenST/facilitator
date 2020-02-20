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

import 'mocha';

import assert from '../../../test_utils/assert';
import ERC20GatewayTokenPair from '../../../../src/m1_facilitator/models/ERC20GatewayTokenPair';

describe('ERC20GatewayTokenPair::compareTo', (): void => {
  it('checks comparision for erc20Gateway -s and valueToken -s are different', async (): Promise<void> => {
    {
      const self = new ERC20GatewayTokenPair(
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      const other = new ERC20GatewayTokenPair(
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189412', // erc20Gateway
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      assert.isOk(
        self.compareTo(other) < 0, // self < other
      );
    }

    {
      const self = new ERC20GatewayTokenPair(
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189412', // erc20Gateway
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      const other = new ERC20GatewayTokenPair(
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      assert.isOk(
        self.compareTo(other) > 0, // self > other
      );
    }

    {
      const self = new ERC20GatewayTokenPair(
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      const other = new ERC20GatewayTokenPair(
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189414', // valueToken
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      assert.isOk(
        self.compareTo(other) < 0, // self < other
      );
    }

    {
      const self = new ERC20GatewayTokenPair(
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189414', // valueToken
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      const other = new ERC20GatewayTokenPair(
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      assert.isOk(
        self.compareTo(other) > 0, // self < other
      );
    }
  });

  it('checks comparision for erc20Gateway -s and valueToken -s are the same', async (): Promise<void> => {
    {
      const self = new ERC20GatewayTokenPair(
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      const other = new ERC20GatewayTokenPair(
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      assert.isOk(
        self.compareTo(other) === 0, // self = other
      );
    }

    {
      const self = new ERC20GatewayTokenPair(
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      const other = new ERC20GatewayTokenPair(
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189416', // utilityToken
      );

      assert.isOk(
        self.compareTo(other) === 0, // self = other
      );
    }

    {
      const self = new ERC20GatewayTokenPair(
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xaBcD9244d798123fde783fcc1c72d3bb8c189416', // utilityToken
      );

      const other = new ERC20GatewayTokenPair(
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189411', // erc20Gateway
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189413', // valueToken
        '0xAbCd9244d798123fde783fcc1c72d3bb8c189415', // utilityToken
      );

      assert.isOk(
        self.compareTo(other) === 0, // self = other
      );
    }
  });
});
