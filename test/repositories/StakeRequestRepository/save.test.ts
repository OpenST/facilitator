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
import assert from '../../test_utils/assert';

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
    const stakeRequestInput = new StakeRequest(
      'stakeRequestHash',
      new BigNumber('1'),
      'beneficiary',
      new BigNumber('2'),
      new BigNumber('3'),
      new BigNumber('4'),
      'gateway',
      'stakerProxy',
    );

    const stakeRequestResponse = await config.repos.stakeRequestRepository.save(
      stakeRequestInput,
    );

    Util.checkInputAgainstOutput(
      stakeRequestInput,
      stakeRequestResponse,
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
      stakeRequestInput,
      stakeRequestOutput as StakeRequest,
    );
  });

  it('Checks update.', async (): Promise<void> => {
    const stakeRequestInput = new StakeRequest(
      'stakeRequestHash',
      new BigNumber('1'),
      'beneficiary',
      new BigNumber('2'),
      new BigNumber('3'),
      new BigNumber('4'),
      'gateway',
      'stakerProxy',
    );

    await config.repos.stakeRequestRepository.save(
      stakeRequestInput,
    );

    const stakeRequestUpdateInput = new StakeRequest(
      'stakeRequestHash',
    );
    stakeRequestUpdateInput.amount = new BigNumber('11');
    stakeRequestUpdateInput.gateway = 'gatewayUpdated';

    const stakeRequestResponse = await config.repos.stakeRequestRepository.save(
      stakeRequestUpdateInput,
    );

    Util.checkInputAgainstOutput(
      new StakeRequest(
        stakeRequestInput.stakeRequestHash,
        stakeRequestUpdateInput.amount,
        stakeRequestInput.beneficiary,
        stakeRequestInput.gasPrice,
        stakeRequestInput.gasLimit,
        stakeRequestInput.nonce,
        stakeRequestUpdateInput.gateway,
        stakeRequestUpdateInput.stakerProxy,
        stakeRequestInput.messageHash,
      ),
      stakeRequestResponse,
    );

    const stakeRequestOutput = await config.repos.stakeRequestRepository.get(
      stakeRequestInput.stakeRequestHash,
    );

    assert.notStrictEqual(
      stakeRequestOutput,
      null,
      'Newly updated stake request exists.',
    );

    Util.checkInputAgainstOutput(
      new StakeRequest(
        stakeRequestInput.stakeRequestHash,
        stakeRequestUpdateInput.amount,
        stakeRequestInput.beneficiary,
        stakeRequestInput.gasPrice,
        stakeRequestInput.gasLimit,
        stakeRequestInput.nonce,
        stakeRequestUpdateInput.gateway,
        stakeRequestUpdateInput.stakerProxy,
        stakeRequestInput.messageHash,
      ),
      stakeRequestOutput as StakeRequest,
    );
  });
});
