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

import MessageTransferRequest from '../../../../src/m0-facilitator/models/MessageTransferRequest';
import Repositories from '../../../../src/m0-facilitator/repositories/Repositories';
import assert from '../../test_utils/assert';
import StubData from '../../test_utils/StubData';
import Util from './util';
import { RequestType } from '../../../../src/m0-facilitator/repositories/MessageTransferRequestRepository';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('MessageTransferRequestRepository::getBySenderProxyNonce', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks retrieval of MessageTransferRequest by sender and nonce.', async (): Promise<void> => {
    const messageHash = '0x00000000000000000000000000000000000000000000000000000000000000333';
    const message = StubData.messageAttributes(
      messageHash,
      '0x0000000000000000000000000000000000000001',
      new BigNumber(300),
    );
    await config.repos.messageRepository.save(
      message,
    );

    const request = StubData.getAMessageTransferRequest('requestHash', RequestType.Stake);
    request.messageHash = messageHash;

    await config.repos.messageTransferRequestRepository.save(
      request,
    );

    const requestOutput = await config.repos.messageTransferRequestRepository.getBySenderProxyNonce(
      request.senderProxy,
      request.nonce,
    );

    assert.notStrictEqual(
      requestOutput,
      null,
      'Stake/Redeem request should exist as it has been just created.',
    );

    Util.checkInputAgainstOutput(
      request,
      requestOutput as MessageTransferRequest,
    );
  });

  it('Checks retrieval of non-existing MessageTransferRequest by senderProxy and nonce.', async (): Promise<void> => {
    const request = await config.repos.messageTransferRequestRepository.getBySenderProxyNonce(
      'nonExistingSenderProxy',
      new BigNumber(1),
    );

    assert.strictEqual(
      request,
      null,
      'MessageTransferRequest with \'nonExistingSenderProxy\' does not exist.',
    );
  });
});
