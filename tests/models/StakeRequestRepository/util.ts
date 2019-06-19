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
  StakeRequestAttributes,
  StakeRequestModel,
} from '../../../src/models/StakeRequestRepository';

import assert = require('assert');

export function checkAttributesAgainstModel(
  stakeRequestAttributes: StakeRequestAttributes,
  stakeRequestModel: StakeRequestModel,
): void {
  assert.strictEqual(
    stakeRequestAttributes.stakeRequestHash,
    stakeRequestModel.stakeRequestHash,
  );

  assert.strictEqual(
    stakeRequestAttributes.messageHash,
    stakeRequestModel.messageHash,
  );

  assert.strictEqual(
    stakeRequestAttributes.amount,
    stakeRequestModel.amount,
  );

  assert.strictEqual(
    stakeRequestAttributes.beneficiary,
    stakeRequestModel.beneficiary,
  );

  assert.strictEqual(
    stakeRequestAttributes.gasPrice,
    stakeRequestModel.gasPrice,
  );

  assert.strictEqual(
    stakeRequestAttributes.gasLimit,
    stakeRequestModel.gasLimit,
  );

  assert.strictEqual(
    stakeRequestAttributes.nonce,
    stakeRequestModel.nonce,
  );

  assert.strictEqual(
    stakeRequestAttributes.gateway,
    stakeRequestModel.gateway,
  );

  assert.strictEqual(
    stakeRequestAttributes.stakerProxy,
    stakeRequestModel.stakerProxy,
  );
}

export function checkAttributesAgainstRaw(
  stakeRequestAttributes: StakeRequestAttributes,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stakeRequestRaw: any,
): void {
  assert.strictEqual(
    stakeRequestAttributes.stakeRequestHash,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.stakeRequestHash.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.messageHash,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.messageHash.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.amount,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.amount.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.beneficiary,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.beneficiary.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.gasPrice,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.gasPrice.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.gasLimit,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.gasLimit.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.nonce,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.nonce.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.gateway,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.gateway.field}`],
  );

  assert.strictEqual(
    stakeRequestAttributes.stakerProxy,
    stakeRequestRaw[`${StakeRequestModel.rawAttributes.stakerProxy.field}`],
  );
}
