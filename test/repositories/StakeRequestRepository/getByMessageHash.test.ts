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
import StubData from '../../test_utils/StubData';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('StakeRequestRepository::getByMessageHash', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks retrieval of StakeRequest by messageHash.', async (): Promise<void> => {
    const messageHash = '0x00000000000000000000000000000000000000000000000000000000000000333';
    const message = StubData.messageAttributes(
      messageHash,
      '0x0000000000000000000000000000000000000001',
      new BigNumber(300),
    );
    await config.repos.messageRepository.save(
      message,
    );

    const stakeRequest = StubData.getAStakeRequest('stakeRequestHash');
    stakeRequest.messageHash = messageHash;

    await config.repos.stakeRequestRepository.save(
      stakeRequest,
    );

    const stakeRequestOutput = await config.repos.stakeRequestRepository.getByMessageHash(
      messageHash,
    );

    assert.notStrictEqual(
      stakeRequestOutput,
      null,
      'Stake request should exists as it has been just created.',
    );

    Util.checkInputAgainstOutput(
      stakeRequest,
      stakeRequestOutput as StakeRequest,
    );
  });

  it('Checks retrieval of non-existing StakeRequest by messageHash.', async (): Promise<void> => {
    const stakeRequest = await config.repos.stakeRequestRepository.getByMessageHash(
      'nonExistingMessageHash',
    );

    assert.strictEqual(
      stakeRequest,
      null,
      'Stake request with \'nonExistingMessageHash\' does not exist.',
    );
  });
});
