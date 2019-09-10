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
import RedeemRequest from '../../../src/models/RedeemRequest';
import {
  MessageDirection, MessageStatus, MessageType,
} from '../../../src/repositories/MessageRepository';
import Repositories from '../../../src/repositories/Repositories';
import assert from '../../test_utils/assert';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
  redeemRequestWithMessageHashB: RedeemRequest;
  redeemRequestWithNullMessageHashC: RedeemRequest;
  redeemRequestWithNullMessageHashD: RedeemRequest;
}
let config: TestConfigInterface;

describe('RedeemRequestRepository::getWithNullMessageHash', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
      redeemRequestWithMessageHashB: new RedeemRequest(
        'redeemRequestHashB',
        new BigNumber('10'),
        new BigNumber('11'),
        'beneficiary',
        new BigNumber('12'),
        new BigNumber('13'),
        new BigNumber('14'),
        'gateway',
        'redeemerB',
        'redeemerProxyB',
        'messageHashB',
      ),
      redeemRequestWithNullMessageHashC: new RedeemRequest(
        'redeemRequestHashC',
        new BigNumber('10'),
        new BigNumber('21'),
        'beneficiaryC',
        new BigNumber('22'),
        new BigNumber('23'),
        new BigNumber('24'),
        'gatewayC',
        'redeemerC',
        'redeemerC',
      ),
      redeemRequestWithNullMessageHashD: new RedeemRequest(
        'redeemRequestHashD',
        new BigNumber('10'),
        new BigNumber('31'),
        'beneficiary',
        new BigNumber('32'),
        new BigNumber('33'),
        new BigNumber('34'),
        'gatewayD',
        'redeemerD',
        'redeemerD',
      ),
    };

    const messageHash = config.redeemRequestWithMessageHashB.messageHash as string;
    const type = MessageType.Redeem;
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

    // We create a message with config.redeemRequestWithMessageHashB.messageHash
    // to be able to create an entry in redeem requests repository with that
    // message hash. Saving a redeem request with non-null message hash
    // in the redeem request repository is only possible if that message hash
    // exists in message repository. This is a foreign key requirement.
    await config.repos.messageRepository.save(
      message,
    );
  });

  it('Checks that no redeem request is returned if '
    + 'there no redeem request with null message hash.', async (): Promise<void> => {
    await config.repos.redeemRequestRepository.save(
      config.redeemRequestWithMessageHashB,
    );

    const redeemRequests = await config.repos
      .redeemRequestRepository.getWithNullMessageHash();

    assert.strictEqual(
      redeemRequests.length,
      0,
      'There is no redeem request with null message hash.',
    );
  });

  it('Checks that all redeem requests '
    + 'with a null message hash are returned.', async (): Promise<void> => {
    await config.repos.redeemRequestRepository.save(
      config.redeemRequestWithMessageHashB,
    );

    await config.repos.redeemRequestRepository.save(
      config.redeemRequestWithNullMessageHashC,
    );

    await config.repos.redeemRequestRepository.save(
      config.redeemRequestWithNullMessageHashD,
    );

    const redeemRequests = await config.repos
      .redeemRequestRepository.getWithNullMessageHash();

    assert.strictEqual(
      redeemRequests.length,
      2,
      'There is two redeem request with null message hash.',
    );

    const redeemRequestOutputC = redeemRequests.find(
      (s: RedeemRequest): boolean => s.redeemRequestHash
        === config.redeemRequestWithNullMessageHashC.redeemRequestHash,
    );

    assert.notStrictEqual(
      redeemRequestOutputC,
      undefined,
      'Redeem request with the specified hash exists in the array.',
    );

    Util.checkInputAgainstOutput(
      config.redeemRequestWithNullMessageHashC,
      redeemRequestOutputC as RedeemRequest,
    );

    const redeemRequestOutputD = redeemRequests.find(
      (s: RedeemRequest): boolean => s.redeemRequestHash
        === config.redeemRequestWithNullMessageHashD.redeemRequestHash,
    );

    assert.notStrictEqual(
      redeemRequestOutputD,
      undefined,
      'Redeem request with the specified hash exists in the array.',
    );

    Util.checkInputAgainstOutput(
      config.redeemRequestWithNullMessageHashD,
      redeemRequestOutputD as RedeemRequest,
    );
  });
});
