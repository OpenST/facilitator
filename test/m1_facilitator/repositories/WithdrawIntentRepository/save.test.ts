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
import { assertErrorMessages } from '../../../test_utils/assert';
import WithdrawIntent from '../../../../src/m1_facilitator/models/WithdrawIntent';
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';

describe('WithdrawIntent::save', (): void => {
  let config: {
    repos: Repositories;
  };
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
    intentHash = '0x00000000000000000000000000000000000000000000000000000000000500';
    messageHash = '0x00000000000000000000000000000000000000000000000000000000000900';
    tokenAddress = '0x0000000000000000000000000000000000000001';
    amount = new BigNumber('100');
    beneficiary = '0x0000000000000000000000000000000000000002';
    createdAt = new Date();
    updatedAt = new Date();
  });

  it('Should create WithdrawIntent model correctly', async (): Promise<void> => {
    const withdrawIntent = new WithdrawIntent(
      messageHash,
      tokenAddress,
      amount,
      beneficiary,
      intentHash,
      createdAt,
      updatedAt,
    );
    const createdWithdrawIntent = await config.repos.withdrawIntentRepository.save(
      withdrawIntent,
    );

    Util.assertWithdrawIntentAttributes(createdWithdrawIntent, withdrawIntent);
  });

  it('Should update WithdrawIntent model correctly', async (): Promise<void> => {
    const withdrawIntent = new WithdrawIntent(
      messageHash,
      tokenAddress,
      amount,
      beneficiary,
      intentHash,
      createdAt,
      updatedAt,
    );

    await config.repos.withdrawIntentRepository.save(
      withdrawIntent,
    );

    withdrawIntent.tokenAddress = '0x0000000000000000000000000000000000000002';
    withdrawIntent.amount = new BigNumber('101');
    withdrawIntent.beneficiary = '0x0000000000000000000000000000000000000004';

    const updateWithdrawIntent = await config.repos.withdrawIntentRepository.save(
      withdrawIntent,
    );

    Util.assertWithdrawIntentAttributes(updateWithdrawIntent, withdrawIntent);
  });

  it('Should fail when token address and beneficiary address is not valid', async (): Promise<void> => {
    const withdrawIntent = new WithdrawIntent(
      messageHash,
      '0x1234',
      amount,
      '0x12345',
      intentHash,
      createdAt,
      updatedAt,
    );
    try {
      await config.repos.withdrawIntentRepository.save(withdrawIntent);
    } catch (error) {
      assertErrorMessages(error.errors, [
        'Validation len on tokenAddress failed',
        'Validation len on beneficiary failed',
      ]);
    }
  });
});
