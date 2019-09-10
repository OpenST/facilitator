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

import BigNumber from 'bignumber.js';

import RedeemRequest from '../../../src/models/RedeemRequest';
import assert from '../../test_utils/assert';

const Util = {
  checkInputAgainstOutput(
    redeemRequestInput: RedeemRequest,
    redeemRequestOutput: RedeemRequest,
  ): void {
    if (redeemRequestInput.redeemRequestHash !== undefined) {
      assert.strictEqual(
        redeemRequestInput.redeemRequestHash,
        redeemRequestOutput.redeemRequestHash,
      );
    }

    if (redeemRequestInput.amount !== undefined) {
      assert.isOk(
        redeemRequestInput.amount.comparedTo(redeemRequestOutput.amount as BigNumber) === 0,
      );
    }

    if (redeemRequestInput.beneficiary !== undefined) {
      assert.strictEqual(
        redeemRequestInput.beneficiary,
        redeemRequestOutput.beneficiary,
      );
    }

    if (redeemRequestInput.gasPrice !== undefined) {
      assert.isOk(
        redeemRequestInput.gasPrice.comparedTo(redeemRequestOutput.gasPrice as BigNumber) === 0,
      );
    }

    if (redeemRequestInput.gasLimit !== undefined) {
      assert.isOk(
        redeemRequestInput.gasLimit.comparedTo(redeemRequestOutput.gasLimit as BigNumber) === 0,
      );
    }

    if (redeemRequestInput.nonce !== undefined) {
      assert.isOk(
        redeemRequestInput.nonce.comparedTo(redeemRequestOutput.nonce as BigNumber) === 0,
      );
    }

    if (redeemRequestInput.cogateway !== undefined) {
      assert.strictEqual(
        redeemRequestInput.cogateway,
        redeemRequestOutput.cogateway,
      );
    }

    if (redeemRequestInput.redeemer !== undefined) {
      assert.strictEqual(
        redeemRequestInput.redeemer,
        redeemRequestOutput.redeemer,
      );
    }

    if (redeemRequestInput.redeemerProxy !== undefined) {
      assert.strictEqual(
        redeemRequestInput.redeemerProxy,
        redeemRequestOutput.redeemerProxy,
      );
    }

    if (redeemRequestInput.messageHash !== undefined) {
      assert.strictEqual(
        redeemRequestInput.messageHash,
        redeemRequestOutput.messageHash,
      );
    }

    if (redeemRequestInput.blockNumber !== undefined) {
      assert.deepStrictEqual(
        redeemRequestInput.blockNumber,
        redeemRequestOutput.blockNumber,
      );
    }

    if (redeemRequestInput.createdAt !== undefined) {
      assert.strictEqual(
        redeemRequestInput.createdAt,
        redeemRequestOutput.createdAt,
      );
    }

    if (redeemRequestInput.updatedAt !== undefined) {
      assert.strictEqual(
        redeemRequestInput.updatedAt,
        redeemRequestOutput.updatedAt,
      );
    }
  },

};

export default Util;
