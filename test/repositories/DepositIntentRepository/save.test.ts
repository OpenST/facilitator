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
import { assertErrorMessages } from '../../test_utils/assert';
import DepositIntent from '../../../src/models/DepositIntent';
import Repositories from '../../../src/repositories/Repositories';

describe('DepositIntentRepository::save', (): void => {
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
    intentHash = '0x00000000000000000000000000000000000000000000000000000000000100';
    messageHash = '0x00000000000000000000000000000000000000000000000000000000000200';
    tokenAddress = '0x0000000000000000000000000000000000000001';
    amount = new BigNumber('100');
    beneficiary = '0x0000000000000000000000000000000000000002';
    createdAt = new Date();
    updatedAt = new Date();
  });

  it('should creating DepositIntent model correctly', async (): Promise<void> => {
    const depositIntent = new DepositIntent(
      intentHash,
      messageHash,
      tokenAddress,
      amount,
      beneficiary,
      createdAt,
      updatedAt,
    );
    const createdDepositIntent = await config.repos.depositIntentRepository.save(
      depositIntent,
    );

    Util.assertDepositIntentAttributes(createdDepositIntent, depositIntent);
  });

  it('should update DepositIntent model correctly', async (): Promise<void> => {
    const depositIntent = new DepositIntent(
      intentHash,
      messageHash,
    );

    await config.repos.depositIntentRepository.save(
      depositIntent,
    );

    depositIntent.tokenAddress = tokenAddress;
    depositIntent.amount = amount;
    depositIntent.beneficiary = beneficiary;

    const updatedDepositIntent = await config.repos.depositIntentRepository.save(
      depositIntent,
    );

    Util.assertDepositIntentAttributes(updatedDepositIntent, depositIntent);
  });

  it('should fail when token address and beneficiary address is not valid', async (): Promise<void> => {
    const depositIntent = new DepositIntent(
      intentHash,
      messageHash,
      '0x1234',
      amount,
      '0x12345',
      createdAt,
      updatedAt,
    );

    try {
      await config.repos.depositIntentRepository.save(depositIntent);
    } catch (error) {
      assertErrorMessages(error.errors, [
        'Validation len on tokenAddress failed',
        'Validation len on beneficiary failed',
      ]);
    }
  });
});
