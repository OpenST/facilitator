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
import assert, { assertErrorMessages } from '../../test_utils/assert';
import Util from './util';
import { RequestType } from '../../../src/repositories/MessageTransferRequestRepository';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('MessageTransferRequestRepository::save', (): void => {
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const beneficiary = '0x0000000000000000000000000000000000000002';
  const sender = '0x0000000000000000000000000000000000000003';
  const senderProxy = '0x0000000000000000000000000000000000000004';

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks creation.', async (): Promise<void> => {
    const requestInput = new MessageTransferRequest(
      'requestHash',
      RequestType.Stake,
      new BigNumber('10'),
      new BigNumber('30000000000000000000000000000000'),
      beneficiary,
      new BigNumber('10000000000000000000000000000000'),
      new BigNumber('50000000000000000000000000000000'),
      new BigNumber('4'),
      gatewayAddress,
      sender,
      senderProxy,
    );

    const requestResponse = await config.repos.messageTransferRequestRepository.save(
      requestInput,
    );

    Util.checkInputAgainstOutput(
      requestInput,
      requestResponse,
    );

    const requestOutput = await config.repos.messageTransferRequestRepository.get(
      requestInput.requestHash,
    );

    assert.notStrictEqual(
      requestOutput,
      null,
      'Newly created request does not exist.',
    );

    Util.checkInputAgainstOutput(
      requestInput,
      requestOutput as MessageTransferRequest,
    );
  });

  it('Checks update.', async (): Promise<void> => {
    const requestInput = new MessageTransferRequest(
      'requestHash',
      RequestType.Stake,
      new BigNumber('10'),
      new BigNumber('1'),
      beneficiary,
      new BigNumber('2'),
      new BigNumber('3'),
      new BigNumber('4'),
      gatewayAddress,
      sender,
      senderProxy,
    );

    await config.repos.messageTransferRequestRepository.save(
      requestInput,
    );

    const requestUpdateInput = new MessageTransferRequest(
      'requestHash',
      RequestType.Stake,
      requestInput.blockNumber,
      new BigNumber('11'),
      requestInput.beneficiary,
      requestInput.gasPrice,
      requestInput.gasLimit,
      requestInput.nonce,
      gatewayAddress,
      sender,
      senderProxy,
    );
    requestUpdateInput.amount = new BigNumber('11');
    requestUpdateInput.gateway = '0x0000000000000000000000000000000000000009';

    const requestResponse = await config.repos.messageTransferRequestRepository.save(
      requestUpdateInput,
    );

    Util.checkInputAgainstOutput(
      new MessageTransferRequest(
        requestInput.requestHash,
        RequestType.Stake,
        requestInput.blockNumber,
        requestUpdateInput.amount,
        requestInput.beneficiary,
        requestInput.gasPrice,
        requestInput.gasLimit,
        requestInput.nonce,
        requestUpdateInput.gateway,
        requestUpdateInput.sender,
        requestUpdateInput.senderProxy,
        requestInput.messageHash,
      ),
      requestResponse,
    );

    const requestOutput = await config.repos.messageTransferRequestRepository.get(
      requestInput.requestHash,
    );

    assert.notStrictEqual(
      requestOutput,
      null,
      'Newly updated request exists.',
    );

    Util.checkInputAgainstOutput(
      new MessageTransferRequest(
        requestInput.requestHash,
        RequestType.Stake,
        requestInput.blockNumber,
        requestUpdateInput.amount,
        requestInput.beneficiary,
        requestInput.gasPrice,
        requestInput.gasLimit,
        requestInput.nonce,
        requestUpdateInput.gateway,
        requestUpdateInput.sender,
        requestUpdateInput.senderProxy,
        requestInput.messageHash,
      ),
      requestOutput as MessageTransferRequest,
    );
  });


  it('should fail when gateway address is null', async (): Promise<void> => {
    const requestInput = new MessageTransferRequest(
      'requestHash',
      RequestType.Stake,
      new BigNumber('10'),
      new BigNumber('1'),
      beneficiary,
      new BigNumber('2'),
      new BigNumber('3'),
      new BigNumber('4'),
      null as any,
      sender,
      senderProxy,
    );

    assert.isRejected(
      config.repos.messageTransferRequestRepository.save(
        requestInput,
      ),
      'MessageTransferRequest.gateway cannot be null',
    );
  });

  it('should fail when gateway address is undefined', async (): Promise<void> => {
    const requestInput = new MessageTransferRequest(
      'requestHash',
      RequestType.Stake,
      new BigNumber('10'),
      new BigNumber('1'),
      beneficiary,
      new BigNumber('2'),
      new BigNumber('3'),
      new BigNumber('4'),
      undefined as any,
      sender,
      senderProxy,
    );

    assert.isRejected(
      config.repos.messageTransferRequestRepository.save(
        requestInput,
      ),
      'MessageTransferRequest.gateway cannot be null',
    );
  });

  it('should fail when multiple parameters are undefined', async (): Promise<void> => {
    // It is used to test when multiple validations failed.

    const requestInput = new MessageTransferRequest(
      'requestHash',
      RequestType.Stake,
      new BigNumber('10'),
      new BigNumber('1'),
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      '0xe34w5',
      '0xe234a',
      '0x1234',
    );

    assert.isRejected(
      config.repos.messageTransferRequestRepository.save(
        requestInput,
      ),
    );

    try {
      await config.repos.messageTransferRequestRepository.save(requestInput);
    } catch (error) {
      assertErrorMessages(error.errors, [
        'MessageTransferRequest.beneficiary cannot be null',
        'MessageTransferRequest.gasPrice cannot be null',
        'MessageTransferRequest.gasLimit cannot be null',
        'MessageTransferRequest.nonce cannot be null',
        'Validation len on gateway failed',
        'Validation len on sender failed',
        'Validation len on senderProxy failed',
      ]);
    }
  });

  it('should pass when max token amount, gasPrice, gasLimit value is saved', async (): Promise<void> => {
    const requestInput = new MessageTransferRequest(
      'requestHash',
      RequestType.Stake,
      new BigNumber('2345677'),
      new BigNumber('999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      beneficiary,
      new BigNumber('999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      new BigNumber('999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      new BigNumber('4'),
      gatewayAddress,
      sender,
      senderProxy,
    );

    const requestResponse = await config.repos.messageTransferRequestRepository.save(
      requestInput,
    );

    Util.checkInputAgainstOutput(
      requestInput,
      requestResponse,
    );
  });

  it('should fail when token amount higher than supported value', async (): Promise<void> => {
    const requestInput = new MessageTransferRequest(
      'requestHash',
      RequestType.Stake,
      new BigNumber('10'),
      new BigNumber('99999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      beneficiary,
      new BigNumber('34'),
      new BigNumber('45'),
      new BigNumber('4'),
      gatewayAddress,
      sender,
      senderProxy,
    );

    await assert.isRejected(
      config.repos.messageTransferRequestRepository.save(
        requestInput,
      ),
      'Validation max on amount failed',
    );
  });

  it('should fail when gasPrice higher than supported value', async (): Promise<void> => {
    const requestInput = new MessageTransferRequest(
      'requestHash',
      RequestType.Stake,
      new BigNumber('10'),
      new BigNumber('45'),
      beneficiary,
      new BigNumber('99999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      new BigNumber('3'),
      new BigNumber('4'),
      gatewayAddress,
      sender,
      senderProxy,
    );

    await assert.isRejected(
      config.repos.messageTransferRequestRepository.save(
        requestInput,
      ),
      'Validation max on gasPrice failed',
    );
  });

  it('should fail when gasLimit higher than supported value', async (): Promise<void> => {
    const requestInput = new MessageTransferRequest(
      'requestHash',
      RequestType.Stake,
      new BigNumber('10'),
      new BigNumber('45'),
      beneficiary,
      new BigNumber('34'),
      new BigNumber('99999999999999999999999999999999999999999999999999999999999999999999999999999999'),
      new BigNumber('4'),
      gatewayAddress,
      sender,
      senderProxy,
    );

    await assert.isRejected(
      config.repos.messageTransferRequestRepository.save(
        requestInput,
      ),
      'Validation max on gasLimit failed',
    );
  });
});
