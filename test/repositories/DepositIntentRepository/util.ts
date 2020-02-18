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


import assert from '../../test_utils/assert';
import DepositIntent from '../../../src/models/DepositIntent';

const Util = {

  assertDepositIntentAttributes(
    inputDepositIntent: DepositIntent,
    expectedDepositIntent: DepositIntent,
  ): void {
    assert.strictEqual(
      inputDepositIntent.intentHash,
      expectedDepositIntent.intentHash,
      'Mismatch in intent hash.',
    );

    assert.strictEqual(
      inputDepositIntent.messageHash,
      expectedDepositIntent.messageHash,
      'Mismatch in message hash.',
    );

    assert.strictEqual(
      inputDepositIntent.tokenAddress,
      expectedDepositIntent.tokenAddress,
      'Mismatch in token address.',
    );

    if (inputDepositIntent.amount && expectedDepositIntent.amount) {
      assert.isOk(
        inputDepositIntent.amount.eq(expectedDepositIntent.amount),
        'Mismatch in deposit amount.',
      );
    }


    assert.strictEqual(
      inputDepositIntent.beneficiary,
      expectedDepositIntent.beneficiary,
      'Mismatch in beneficiary address.',
    );

    if (inputDepositIntent.createdAt && expectedDepositIntent.createdAt) {
      assert.strictEqual(
        inputDepositIntent.createdAt.getTime(),
        expectedDepositIntent.createdAt.getTime(),
        'Expected created at time is different than the one received in response.',
      );
    }

    assert.isNotNull(
      inputDepositIntent.updatedAt,
      'Updated at should not be null',
    );
  },

};

export default Util;
