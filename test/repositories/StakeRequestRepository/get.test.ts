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
import assert from '../../test_utils/assert';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('StakeRequestRepository::get', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks retrieval of an existing stake request.', async (): Promise<void> => {
    const stakeRequestInput = new StakeRequest(
      'stakeRequestHash',
      new BigNumber('1'),
      'beneficiary',
      new BigNumber('2'),
      new BigNumber('3'),
      new BigNumber('4'),
      'gateway',
      'staker',
      'stakerProxy',
    );

    await config.repos.stakeRequestRepository.save(
      stakeRequestInput,
    );

    const stakeRequestOutput = await config.repos.stakeRequestRepository.get(
      stakeRequestInput.stakeRequestHash,
    );

    assert.notStrictEqual(
      stakeRequestOutput,
      null,
      'Stake request should exists as it has been just created.',
    );

    Util.checkInputAgainstOutput(
      stakeRequestInput,
      stakeRequestOutput as StakeRequest,
    );
  });

  it('Checks retrieval of non-existing model.', async (): Promise<void> => {
    const stakeRequest = await config.repos.stakeRequestRepository.get(
      'nonExistingHash',
    );

    assert.strictEqual(
      stakeRequest,
      null,
      'Stake request with \'nonExistingHash\' does not exist.',
    );
  });
});
