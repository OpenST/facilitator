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
import Util from './util';
import { RequestType } from '../../../src/repositories/MessageTransferRequestRepository';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('MessageTransferRequestRepository::get', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks retrieval of an existing message transfer stake/redeem request.', async (): Promise<void> => {
    const requestInput = new MessageTransferRequest(
      'requestHash',
      RequestType.Stake,
      new BigNumber('10'),
      new BigNumber('1'),
      'beneficiary',
      new BigNumber('2'),
      new BigNumber('3'),
      new BigNumber('4'),
      'gateway',
      'sender',
      'senderProxy',
    );

    await config.repos.messageTransferRequestRepository.save(
      requestInput,
    );

    const requestOutput = await config.repos.messageTransferRequestRepository.get(
      requestInput.requestHash,
    );

    assert.notStrictEqual(
      requestOutput,
      null,
      'Stake request should exists as it has been just created.',
    );

    Util.checkInputAgainstOutput(
      requestInput,
      requestOutput as MessageTransferRequest,
    );
  });

  it('Checks retrieval of non-existing model.', async (): Promise<void> => {
    const request = await config.repos.messageTransferRequestRepository.get(
      'nonExistingHash',
    );

    assert.strictEqual(
      request,
      null,
      'Stake request with \'nonExistingHash\' does not exist.',
    );
  });
});
