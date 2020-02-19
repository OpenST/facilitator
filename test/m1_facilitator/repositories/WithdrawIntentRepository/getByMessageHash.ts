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


import BigNumber from 'bignumber.js';

import Util from './util';
import assert from '../../../test_utils/assert';
import WithdrawIntent from '../../../../src/m1_facilitator/models/WithdrawIntent';
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';

describe('WithdrawIntent::getByMessageHash', (): void => {
  let config: {
    repos: Repositories;
  };
  let withdrawIntent: WithdrawIntent;
  let intentHash: string;
  let messageHash: string;
  let tokenAddress: string;
  let amount: BigNumber;
  let beneficiary: string;
  let createdAt: Date;
  let updatedAt: Date;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };

    intentHash = '0x00000000000000000000000000000000000000000000000000000000000100';
    messageHash = '0x00000000000000000000000000000000000000000000000000000000000200';
    tokenAddress = '0x0000000000000000000000000000000000000001';
    amount = new BigNumber('100');
    beneficiary = '0x0000000000000000000000000000000000000002';
    createdAt = new Date();
    updatedAt = new Date();

    withdrawIntent = new WithdrawIntent(
      intentHash,
      messageHash,
      tokenAddress,
      amount,
      beneficiary,
      createdAt,
      updatedAt,
    );
    await config.repos.withdrawIntentRepository.save(
      withdrawIntent,
    );
  });

  it('should pass when fetching WithdrawIntent model', async (): Promise<void> => {
    const getResponse = await config.repos.withdrawIntentRepository.getByMessageHash(
      withdrawIntent.messageHash,
    );

    Util.assertWithdrawIntentAttributes(getResponse as WithdrawIntent, withdrawIntent);
  });

  it('should return null when querying for non-existing '
    + 'message hash', async (): Promise<void> => {
    const nonExistingMessageHash = '0x00000000000000000000000000000000000000000000000000000000000111';

    const getResponse = await config.repos.withdrawIntentRepository.getByMessageHash(
      nonExistingMessageHash,
    );

    assert.strictEqual(
      getResponse,
      null,
      "WithdrawIntent model doesn't exist.",
    );
  });
});
