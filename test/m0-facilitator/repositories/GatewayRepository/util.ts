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


import Gateway from '../../../../src/m0-facilitator/models/Gateway';
import assert from '../../test_utils/assert';

const Util = {
  assertGatewayAttributes(
    inputGateway: Gateway,
    expectedGateway: Gateway,
  ): void {
    assert.strictEqual(
      inputGateway.gatewayAddress,
      expectedGateway.gatewayAddress,
      'gatewayAddress should match',
    );

    assert.strictEqual(
      inputGateway.chain,
      expectedGateway.chain,
      'chainId should match',
    );

    assert.strictEqual(
      inputGateway.remoteGatewayAddress,
      expectedGateway.remoteGatewayAddress,
      'remoteGatewayAddress should match',
    );

    assert.strictEqual(
      inputGateway.gatewayType,
      expectedGateway.gatewayType,
      'gatewayType should match',
    );

    assert.strictEqual(
      inputGateway.tokenAddress,
      expectedGateway.tokenAddress,
      'tokenAddress should match',
    );

    assert.strictEqual(
      inputGateway.anchorAddress,
      expectedGateway.anchorAddress,
      'anchorAddress should match',
    );

    assert.notStrictEqual(
      inputGateway.bounty,
      expectedGateway.bounty,
      'bounty should match',
    );

    if (inputGateway.activation !== undefined) {
      assert.strictEqual(
        inputGateway.activation,
        expectedGateway.activation,
        'activation should match',
      );
    }

    if (inputGateway.lastRemoteGatewayProvenBlockHeight) {
      assert.notStrictEqual(
        inputGateway.lastRemoteGatewayProvenBlockHeight,
        expectedGateway.lastRemoteGatewayProvenBlockHeight,
        'lastRemoteGatewayProvenBlockHeight should match',
      );
    }

    if (inputGateway.createdAt && expectedGateway.createdAt) {
      assert.strictEqual(
        inputGateway.createdAt.getTime(),
        expectedGateway.createdAt.getTime(),
        'Expected created at time is different than the one received in response',
      );
    }

    assert.isNotNull(
      inputGateway.updatedAt,
      'Updated at should not be null',
    );
  },

};

export default Util;
