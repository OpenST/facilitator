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
} from '../../../src/repositories/StakeRequestRepository';

import StakeRequest from '../../../src/models/StakeRequest';

import assert from '../../utils/assert';

const Util = {
  checkStakeRequestAgainstAttributes(
    stakeRequest: StakeRequest,
    stakeRequestAttributes: StakeRequestAttributes,
  ): void {
    assert.strictEqual(
      stakeRequest.stakeRequestHash,
      stakeRequestAttributes.stakeRequestHash,
    );

    if (stakeRequestAttributes.hasOwnProperty('messageHash')) {
      assert.strictEqual(
        stakeRequest.messageHash,
        stakeRequestAttributes.messageHash,
      );
    }

    assert.notStrictEqual(
      stakeRequest.amount,
      stakeRequestAttributes.amount,
    );

    assert.strictEqual(
      stakeRequest.beneficiary,
      stakeRequestAttributes.beneficiary,
    );

    assert.notStrictEqual(
      stakeRequest.gasPrice,
      stakeRequestAttributes.gasPrice,
    );

    assert.notStrictEqual(
      stakeRequest.gasLimit,
      stakeRequestAttributes.gasLimit,
    );

    assert.notStrictEqual(
      stakeRequest.nonce,
      stakeRequestAttributes.nonce,
    );

    assert.strictEqual(
      stakeRequest.gateway,
      stakeRequestAttributes.gateway,
    );

    assert.strictEqual(
      stakeRequest.stakerProxy,
      stakeRequestAttributes.stakerProxy,
    );
  },

};

export default Util;
