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


import assert from '../../../test_utils/assert';
import Gateway from '../../../../src/m1_facilitator/models/Gateway';

const Util = {

  assertGatewayAttributes(
    inputGateway: Gateway,
    expectedGateway: Gateway,
  ): void {
    assert.strictEqual(
      inputGateway.gatewayGA,
      expectedGateway.gatewayGA,
      'Mismatch in gateway\'s global address.',
    );

    assert.strictEqual(
      inputGateway.remoteGA,
      expectedGateway.remoteGA,
      'Mismatch in remote\'s global address',
    );

    assert.strictEqual(
      inputGateway.gatewayType,
      expectedGateway.gatewayType,
      'Mismatch in type of gateway.',
    );

    assert.strictEqual(
      inputGateway.destinationGA,
      expectedGateway.destinationGA,
      'Mismatch in destination global address.',
    );

    assert.strictEqual(
      inputGateway.remoteGatewayLastProvenBlockNumber,
      inputGateway.remoteGatewayLastProvenBlockNumber,
      'Expected remote gateway\'s last proven block number is '
      + `${inputGateway.remoteGatewayLastProvenBlockNumber} but got`
      + `${expectedGateway.remoteGatewayLastProvenBlockNumber}.`,
    );

    assert.strictEqual(
      inputGateway.anchorGA,
      expectedGateway.anchorGA,
      'Mismatch in anchor\'s global address.',
    );

    if (inputGateway.createdAt && expectedGateway.createdAt) {
      assert.strictEqual(
        inputGateway.createdAt.getTime(),
        expectedGateway.createdAt.getTime(),
        'Expected created at time is different than the one received in response.',
      );
    }

    assert.isNotNull(
      inputGateway.updatedAt,
      'Updated at should not be null.',
    );
  },

};

export default Util;
