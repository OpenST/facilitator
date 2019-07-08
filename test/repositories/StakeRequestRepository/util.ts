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
import StakeRequest from '../../../src/models/StakeRequest';

import assert from '../../test_utils/assert';

const Util = {
  checkInputAgainstOutput(
    stakeRequestInput: StakeRequest,
    stakeRequestOutput: StakeRequest,
  ): void {
    if (stakeRequestInput.stakeRequestHash !== undefined) {
      assert.strictEqual(
        stakeRequestInput.stakeRequestHash,
        stakeRequestOutput.stakeRequestHash,
      );
    }

    if (stakeRequestInput.amount !== undefined) {
      assert.isOk(
        stakeRequestInput.amount.comparedTo(stakeRequestOutput.amount as BigNumber) === 0,
      );
    }

    if (stakeRequestInput.beneficiary !== undefined) {
      assert.strictEqual(
        stakeRequestInput.beneficiary,
        stakeRequestOutput.beneficiary,
      );
    }

    if (stakeRequestInput.gasPrice !== undefined) {
      assert.isOk(
        stakeRequestInput.gasPrice.comparedTo(stakeRequestOutput.gasPrice as BigNumber) === 0,
      );
    }

    if (stakeRequestInput.gasLimit !== undefined) {
      assert.isOk(
        stakeRequestInput.gasLimit.comparedTo(stakeRequestOutput.gasLimit as BigNumber) === 0,
      );
    }

    if (stakeRequestInput.nonce !== undefined) {
      assert.isOk(
        stakeRequestInput.nonce.comparedTo(stakeRequestOutput.nonce as BigNumber) === 0,
      );
    }

    if (stakeRequestInput.gateway !== undefined) {
      assert.strictEqual(
        stakeRequestInput.gateway,
        stakeRequestOutput.gateway,
      );
    }

    if (stakeRequestInput.stakerProxy !== undefined) {
      assert.strictEqual(
        stakeRequestInput.stakerProxy,
        stakeRequestOutput.stakerProxy,
      );
    }

    if (stakeRequestInput.messageHash !== undefined) {
      assert.strictEqual(
        stakeRequestInput.messageHash,
        stakeRequestOutput.messageHash,
      );
    }

    if (stakeRequestInput.createdAt !== undefined) {
      assert.strictEqual(
        stakeRequestInput.createdAt,
        stakeRequestOutput.createdAt,
      );
    }

    if (stakeRequestInput.updatedAt !== undefined) {
      assert.strictEqual(
        stakeRequestInput.updatedAt,
        stakeRequestOutput.updatedAt,
      );
    }
  },

};

export default Util;
