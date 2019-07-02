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
import {
  MessageAttributes,
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../../../src/repositories/MessageRepository';


interface TestConfigInterface {
  repos: Repositories;
  stakeRequestWithMessageHashB: StakeRequest;
  stakeRequestWithNullMessageHashC: StakeRequest;
  stakeRequestWithNullMessageHashD: StakeRequest;
}
let config: TestConfigInterface;

describe('StakeRequestRepository::getWithNullMessageHash', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
      stakeRequestWithMessageHashB: new StakeRequest(
        'stakeRequestHashB',
        new BigNumber('11'),
        'beneficiary',
        new BigNumber('12'),
        new BigNumber('13'),
        new BigNumber('14'),
        'gateway',
        'stakerProxyB',
        'messageHashB',
      ),
      stakeRequestWithNullMessageHashC: new StakeRequest(
        'stakeRequestHashC',
        new BigNumber('21'),
        'beneficiaryC',
        new BigNumber('22'),
        new BigNumber('23'),
        new BigNumber('24'),
        'gatewayC',
        'stakerProxyC',
      ),
      stakeRequestWithNullMessageHashD: new StakeRequest(
        'stakeRequestHashD',
        new BigNumber('31'),
        'beneficiary',
        new BigNumber('32'),
        new BigNumber('33'),
        new BigNumber('34'),
        'gatewayD',
        'stakerProxyD',
      ),
    };

    const messageAttributes: MessageAttributes = {
      messageHash: config.stakeRequestWithMessageHashB.messageHash as string,
      type: MessageType.Stake,
      gatewayAddress: '0x0000000000000000000000000000000000000001',
      sourceStatus: MessageStatus.Declared,
      targetStatus: MessageStatus.Undeclared,
      gasPrice: new BigNumber('1'),
      gasLimit: new BigNumber('1'),
      nonce: new BigNumber('1'),
      sender: '0x0000000000000000000000000000000000000002',
      direction: MessageDirection.OriginToAuxiliary,
      sourceDeclarationBlockHeight: new BigNumber('1'),
    };

    await config.repos.messageRepository.create(
      messageAttributes,
    );
  });

  it('Checks that no stake request is returned if '
    + 'there no stake request with null message hash.', async (): Promise<void> => {
    await config.repos.stakeRequestRepository.save(
      config.stakeRequestWithMessageHashB,
    );

    const stakeRequests = await config.repos
      .stakeRequestRepository.getWithNullMessageHash();

    assert.strictEqual(
      stakeRequests.length,
      0,
      'There is no stake request with null message hash.',
    );
  });

  it('Checks that all stake requests '
    + 'with a null message hash are returned.', async (): Promise<void> => {
    await config.repos.stakeRequestRepository.save(
      config.stakeRequestWithMessageHashB,
    );

    await config.repos.stakeRequestRepository.save(
      config.stakeRequestWithNullMessageHashC,
    );

    await config.repos.stakeRequestRepository.save(
      config.stakeRequestWithNullMessageHashD,
    );

    const stakeRequests = await config.repos
      .stakeRequestRepository.getWithNullMessageHash();

    assert.strictEqual(
      stakeRequests.length,
      2,
      'There is two stake request with null message hash.',
    );

    const stakeRequestOutputC = stakeRequests.find(
      (s: StakeRequest): boolean => s.stakeRequestHash
        === config.stakeRequestWithNullMessageHashC.stakeRequestHash,
    );

    assert.notStrictEqual(
      stakeRequestOutputC,
      undefined,
      'Stake request with the specified hash exists in the array.',
    );

    Util.checkInputAgainstOutput(
      config.stakeRequestWithNullMessageHashC,
      stakeRequestOutputC as StakeRequest,
    );

    const stakeRequestOutputD = stakeRequests.find(
      (s: StakeRequest): boolean => s.stakeRequestHash
        === config.stakeRequestWithNullMessageHashD.stakeRequestHash,
    );

    assert.notStrictEqual(
      stakeRequestOutputD,
      undefined,
      'Stake request with the specified hash exists in the array.',
    );

    Util.checkInputAgainstOutput(
      config.stakeRequestWithNullMessageHashD,
      stakeRequestOutputD as StakeRequest,
    );
  });
});
