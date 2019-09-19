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

import MessageTransferRequest from '../../../src/models/MessageTransferRequest';
import Repositories from '../../../src/repositories/Repositories';
import assert from '../../test_utils/assert';
import StubData from '../../test_utils/StubData';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('MessageTransferRequestRepository::getByMessageHash', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks retrieval of MessageTransferRequest by messageHash.', async (): Promise<void> => {
    const messageHash = '0x00000000000000000000000000000000000000000000000000000000000000333';
    const message = StubData.messageAttributes(
      messageHash,
      '0x0000000000000000000000000000000000000001',
      new BigNumber(300),
    );
    await config.repos.messageRepository.save(
      message,
    );

    const request = StubData.getAStakeRequest('requestHash');
    request.messageHash = messageHash;

    await config.repos.messageTransferRequestRepository.save(
      request,
    );

    const requestOutput = await config.repos.messageTransferRequestRepository.getByMessageHash(
      messageHash,
    );

    assert.notStrictEqual(
      requestOutput,
      null,
      'Stake/Redeem request should exists as it has been just created.',
    );

    Util.checkInputAgainstOutput(
      request,
      requestOutput as MessageTransferRequest,
    );
  });

  it('Checks retrieval of non-existing MessageTransferRequest by messageHash.', async (): Promise<void> => {
    const request = await config.repos.messageTransferRequestRepository.getByMessageHash(
      'nonExistingMessageHash',
    );

    assert.strictEqual(
      request,
      null,
      'MessageTransferRequest with \'nonExistingMessageHash\' does not exist.',
    );
  });
});