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

import {
  GatewayAttributes,
  Gateway,
} from '../../../src/repositories/GatewayRepository';

import assert from '../../test_utils/assert';

const Util = {
  checkGatewayAgainstAttributes(
    gateway: Gateway,
    gatewayAttributes: GatewayAttributes,
  ): void {
    assert.strictEqual(
      gateway.gatewayAddress,
      gatewayAttributes.gatewayAddress,
      'gatewayAddress should match',
    );

    assert.strictEqual(
      gateway.chain,
      gatewayAttributes.chain,
      'chainId should match',
    );

    assert.strictEqual(
      gateway.remoteGatewayAddress,
      gatewayAttributes.remoteGatewayAddress,
      'remoteGatewayAddress should match',
    );

    assert.strictEqual(
      gateway.gatewayType,
      gatewayAttributes.gatewayType,
      'gatewayType should match',
    );

    assert.strictEqual(
      gateway.tokenAddress,
      gatewayAttributes.tokenAddress,
      'tokenAddress should match',
    );

    assert.strictEqual(
      gateway.anchorAddress,
      gatewayAttributes.anchorAddress,
      'anchorAddress should match',
    );

    assert.notStrictEqual(
      gateway.bounty,
      gatewayAttributes.bounty,
      'bounty should match',
    );

    assert.strictEqual(
      gateway.activation,
      gatewayAttributes.activation,
      'activation should match',
    );

    if (gatewayAttributes.lastRemoteGatewayProvenBlockHeight) {
      assert.notStrictEqual(
        gateway.lastRemoteGatewayProvenBlockHeight,
        gatewayAttributes.lastRemoteGatewayProvenBlockHeight,
        'lastRemoteGatewayProvenBlockHeight should match',
      );
    }
  },

};

export default Util;
