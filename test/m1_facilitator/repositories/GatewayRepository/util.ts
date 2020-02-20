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
      'Mismatch in remote gateway global address.',
    );

    assert.strictEqual(
      inputGateway.gatewayType,
      expectedGateway.gatewayType,
      'Mismatch in type of gateway.',
    );

    assert.strictEqual(
      inputGateway.destinationGA,
      expectedGateway.destinationGA,
      'Mismatch in ERC20 gateway address.',
    );

    const {
      remoteGatewayLastProvenBlockNumber: expectedRemoteGatewayLastProvenBlockNumber,
    } = expectedGateway;

    const {
      remoteGatewayLastProvenBlockNumber: inputRemoteGatewayLastProvenBlockNumber,
    } = inputGateway;

    assert.isOk(
      expectedRemoteGatewayLastProvenBlockNumber
      && inputRemoteGatewayLastProvenBlockNumber
      && expectedRemoteGatewayLastProvenBlockNumber.eq(inputRemoteGatewayLastProvenBlockNumber),
      'Expected remote gateway\'s last proven block number is '
      + `${inputRemoteGatewayLastProvenBlockNumber && inputRemoteGatewayLastProvenBlockNumber.toString(10)} but got`
      + `${expectedRemoteGatewayLastProvenBlockNumber && expectedRemoteGatewayLastProvenBlockNumber.toString(10)}.`,
    );

    assert.strictEqual(
      inputGateway.anchorGA,
      expectedGateway.anchorGA,
      'Mismatch in anchor\'s global address.',
    );

    assert.strictEqual(
      inputGateway.createdAt && inputGateway.createdAt.getTime(),
      expectedGateway.createdAt && expectedGateway.createdAt.getTime(),
      'Mismatch in created at field of the gateway model.',
    );

    assert.isNotNull(
      inputGateway.updatedAt,
      'Updated at field should not be null.',
    );
  },
};

export default Util;
