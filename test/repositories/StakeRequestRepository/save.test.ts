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

import 'mocha';
import BigNumber from 'bignumber.js';
import StakeRequest from '../../../src/models/StakeRequest';
import Repositories from '../../../src/repositories/Repositories';
import Util from './util';
import assert from '../../utils/assert';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('StakeRequestRepository::save', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks creation.', async (): Promise<void> => {
    const stakeRequestInput: StakeRequest = {
      stakeRequestHash: 'stakeRequestHash',
      amount: new BigNumber('1'),
      beneficiary: 'beneficiary',
      gasPrice: new BigNumber('2'),
      gasLimit: new BigNumber('3'),
      nonce: new BigNumber('4'),
      gateway: 'gateway',
      stakerProxy: 'stakerProxy',
    };

    await config.repos.stakeRequestRepository.save(
      stakeRequestInput,
    );

    const stakeRequestOutput = await config.repos.stakeRequestRepository.get(
      stakeRequestInput.stakeRequestHash,
    );

    assert.notStrictEqual(
      stakeRequestOutput,
      null,
      'Newly created stake request exists.',
    );

    Util.checkInputAgainstOutput(
      stakeRequestInput,
      stakeRequestOutput as StakeRequest,
    );

    const stakeRequest = await config.repos.stakeRequestRepository.get(
      stakeRequestInput.stakeRequestHash,
    );

    assert.notStrictEqual(
      stakeRequest,
      null,
      'Newly created stake request does not exist.',
    );

    Util.checkInputAgainstOutput(
      stakeRequestInput,
      stakeRequestOutput as StakeRequest,
    );
  });

  it('Checks update.', async (): Promise<void> => {
    const stakeRequestInput: StakeRequest = {
      stakeRequestHash: 'stakeRequestHash',
      amount: new BigNumber('1'),
      beneficiary: 'beneficiary',
      gasPrice: new BigNumber('2'),
      gasLimit: new BigNumber('3'),
      nonce: new BigNumber('4'),
      gateway: 'gateway',
      stakerProxy: 'stakerProxy',
    };

    await config.repos.stakeRequestRepository.save(
      stakeRequestInput,
    );

    const stakeRequestUpdateInput: StakeRequest = {
      stakeRequestHash: 'stakeRequestHash',
      amount: new BigNumber('11'),
      gateway: 'gatewayUpdated',
    };

    await config.repos.stakeRequestRepository.save(
      stakeRequestUpdateInput,
    );

    const stakeRequestOutput = await config.repos.stakeRequestRepository.get(
      stakeRequestInput.stakeRequestHash,
    );

    assert.notStrictEqual(
      stakeRequestOutput,
      null,
      'Newly created stake request does not exist.',
    );

    Util.checkInputAgainstOutput(
      {
        stakeRequestHash: stakeRequestInput.stakeRequestHash,
        amount: stakeRequestUpdateInput.amount,
        beneficiary: stakeRequestInput.beneficiary,
        gasPrice: stakeRequestInput.gasPrice,
        gasLimit: stakeRequestInput.gasLimit,
        nonce: stakeRequestInput.nonce,
        gateway: stakeRequestUpdateInput.gateway,
        stakerProxy: stakeRequestUpdateInput.stakerProxy,
        messageHash: stakeRequestInput.messageHash,
      },
      stakeRequestOutput as StakeRequest,
    );
  });
});
