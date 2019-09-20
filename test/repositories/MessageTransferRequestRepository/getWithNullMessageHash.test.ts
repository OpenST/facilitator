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

import Message from '../../../src/models/Message';
import MessageTransferRequest from '../../../src/models/MessageTransferRequest';
import {
  MessageDirection, MessageStatus, MessageType,
} from '../../../src/repositories/MessageRepository';
import Repositories from '../../../src/repositories/Repositories';
import assert from '../../test_utils/assert';
import Util from './util';
import { RequestType } from '../../../src/repositories/MessageTransferRequestRepository';

interface TestConfigInterface {
  repos: Repositories;
  requestWithMessageHashB: MessageTransferRequest;
  requestWithNullMessageHashC: MessageTransferRequest;
  requestWithNullMessageHashD: MessageTransferRequest;
}
let config: TestConfigInterface;

describe('MessageTransferRequestRepository::getWithNullMessageHash', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
      requestWithMessageHashB: new MessageTransferRequest(
        'requestHashB',
        RequestType.Stake,
        new BigNumber('10'),
        new BigNumber('11'),
        'beneficiary',
        new BigNumber('12'),
        new BigNumber('13'),
        new BigNumber('14'),
        'gateway',
        'senderB',
        'senderProxyB',
        'messageHashB',
      ),
      requestWithNullMessageHashC: new MessageTransferRequest(
        'requestHashC',
        RequestType.Stake,
        new BigNumber('10'),
        new BigNumber('21'),
        'beneficiaryC',
        new BigNumber('22'),
        new BigNumber('23'),
        new BigNumber('24'),
        'gatewayC',
        'senderC',
        'senderC',
      ),
      requestWithNullMessageHashD: new MessageTransferRequest(
        'requestHashD',
        RequestType.Stake,
        new BigNumber('10'),
        new BigNumber('31'),
        'beneficiary',
        new BigNumber('32'),
        new BigNumber('33'),
        new BigNumber('34'),
        'gatewayD',
        'senderD',
        'senderD',
      ),
    };

    const messageHash = config.requestWithMessageHashB.messageHash as string;
    const type = MessageType.Stake;
    const gatewayAddress = '0x0000000000000000000000000000000000000001';
    const sourceStatus = MessageStatus.Declared;
    const targetStatus = MessageStatus.Undeclared;
    const gasPrice = new BigNumber('1');
    const gasLimit = new BigNumber('1');
    const nonce = new BigNumber('1');
    const sender = '0x0000000000000000000000000000000000000002';
    const direction = MessageDirection.OriginToAuxiliary;
    const sourceDeclarationBlockHeight = new BigNumber('1');
    const secret = '0x00000000000000000000000000000000000000000000000000000000000000334';
    const hashLock = '0x00000000000000000000000000000000000000000000000000000000000000335';
    const createdAt = new Date();
    const updatedAt = new Date();

    const message = new Message(
      messageHash,
      type,
      gatewayAddress,
      sourceStatus,
      targetStatus,
      gasPrice,
      gasLimit,
      nonce,
      sender,
      direction,
      sourceDeclarationBlockHeight,
      secret,
      hashLock,
      createdAt,
      updatedAt,
    );

    // We create a message with config.requestWithMessageHashB.messageHash
    // to be able to create an entry in requests repository with that
    // message hash. Saving a request with non-null message hash
    // in the request repository is only possible if that message hash
    // exists in message repository. This is a foreign key requirement.
    await config.repos.messageRepository.save(
      message,
    );
  });

  it('Checks that no request is returned if '
    + 'there no request with null message hash.', async (): Promise<void> => {
    await config.repos.messageTransferRequestRepository.save(
      config.requestWithMessageHashB,
    );

    const requests = await config.repos
      .messageTransferRequestRepository.getWithNullMessageHash();

    assert.strictEqual(
      requests.length,
      0,
      'There is no request with null message hash.',
    );
  });

  it('Checks that all requests '
    + 'with a null message hash are returned.', async (): Promise<void> => {
    await config.repos.messageTransferRequestRepository.save(
      config.requestWithMessageHashB,
    );

    await config.repos.messageTransferRequestRepository.save(
      config.requestWithNullMessageHashC,
    );

    await config.repos.messageTransferRequestRepository.save(
      config.requestWithNullMessageHashD,
    );

    const requests = await config.repos
      .messageTransferRequestRepository.getWithNullMessageHash();

    assert.strictEqual(
      requests.length,
      2,
      'There is two requests with null message hash.',
    );

    const requestOutputC = requests.find(
      (s: MessageTransferRequest): boolean => s.requestHash
        === config.requestWithNullMessageHashC.requestHash,
    );

    assert.notStrictEqual(
      requestOutputC,
      undefined,
      'MessageTransferRequest with the specified hash exists in the array.',
    );

    Util.checkInputAgainstOutput(
      config.requestWithNullMessageHashC,
      requestOutputC as MessageTransferRequest,
    );

    const requestOutputD = requests.find(
      (s: MessageTransferRequest): boolean => s.requestHash
        === config.requestWithNullMessageHashD.requestHash,
    );

    assert.notStrictEqual(
      requestOutputD,
      undefined,
      'MessageTransferRequest with the specified hash exists in the array.',
    );

    Util.checkInputAgainstOutput(
      config.requestWithNullMessageHashD,
      requestOutputD as MessageTransferRequest,
    );
  });
});
