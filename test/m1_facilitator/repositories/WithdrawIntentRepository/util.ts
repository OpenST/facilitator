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
import WithdrawIntent from '../../../../src/m1_facilitator/models/WithdrawIntent';

const Util = {
  assertWithdrawIntentAttributes(
    inputWithdrawIntent: WithdrawIntent,
    expectedWithdrawIntent: WithdrawIntent,
  ): void {
    assert.strictEqual(
      inputWithdrawIntent.intentHash,
      expectedWithdrawIntent.intentHash,
      'Mismatch in intent hash.',
    );

    assert.strictEqual(
      inputWithdrawIntent.messageHash,
      expectedWithdrawIntent.messageHash,
      'Mismatch in message hash.',
    );

    assert.strictEqual(
      inputWithdrawIntent.tokenAddress,
      expectedWithdrawIntent.tokenAddress,
      'Mismatch in token address.',
    );

    if (inputWithdrawIntent.amount && expectedWithdrawIntent.amount) {
      assert.isOk(
        inputWithdrawIntent.amount.eq(expectedWithdrawIntent.amount),
        'Mismatch in Withdraw amount.',
      );
    }


    assert.strictEqual(
      inputWithdrawIntent.beneficiary,
      expectedWithdrawIntent.beneficiary,
      'Mismatch in beneficiary address.',
    );

    if (inputWithdrawIntent.createdAt && expectedWithdrawIntent.createdAt) {
      assert.strictEqual(
        inputWithdrawIntent.createdAt.getTime(),
        expectedWithdrawIntent.createdAt.getTime(),
        'Expected created at time is different than the one received in response.',
      );
    }

    assert.isNotNull(
      inputWithdrawIntent.updatedAt,
      'Updated at should not be null',
    );
  },

};

export default Util;
