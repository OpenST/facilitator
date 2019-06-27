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

import {
  StakeRequestAttributes,
  StakeRequest,
} from '../../../src/models/StakeRequestRepository';

import Database from '../../../src/models/Database';

import StakeRequestUtil from './util';
import { MessageAttributes } from '../../../src/models/MessageRepository';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { assert } = chai;

interface TestConfigInterface {
  db: Database;
}
let config: TestConfigInterface;

describe('StakeRequestRepository::update', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Updates existing existing stake request.', async (): Promise<void> => {
    const stakeRequestAttributes: StakeRequestAttributes = {
      stakeRequestHash: 'stakeRequestHash',
      amount: new BigNumber('1'),
      beneficiary: 'beneficiary',
      gasPrice: new BigNumber('2'),
      gasLimit: new BigNumber('3'),
      nonce: new BigNumber('4'),
      gateway: 'gateway',
      stakerProxy: 'stakerProxy',
    };

    await config.db.stakeRequestRepository.create(
      stakeRequestAttributes,
    );

    const updatedMessageHash = 'updatedMessageHash';
    const messageAttributes: MessageAttributes = {
      messageHash: updatedMessageHash,
      type: 'stakeAndMint',
      gatewayAddress: '0x497A49648885f7aaC3d761817F191ee1AFAF399C',
      sourceStatus: 'Undeclared',
      targetStatus: 'Undeclared',
      gasPrice: new BigNumber('1'),
      gasLimit: new BigNumber('1'),
      nonce: new BigNumber('1'),
      sender: '0x497B49648885f7aaC3d761817F191ee1AFAF399C',
      direction: 'o2a',
      sourceDeclarationBlockHeight: new BigNumber('1'),
    };
    await config.db.messageRepository.create(
      messageAttributes,
    );

    await config.db.stakeRequestRepository.updateMessageHash(
      stakeRequestAttributes.stakeRequestHash,
      updatedMessageHash,
    );

    const stakeRequest = await config.db.stakeRequestRepository.get(
      stakeRequestAttributes.stakeRequestHash,
    );

    assert.notStrictEqual(
      stakeRequest,
      null,
      'Newly updated stake request does not exist.',
    );

    const updatedStakeRequestAttributes = stakeRequestAttributes;
    updatedStakeRequestAttributes.messageHash = updatedMessageHash;

    // Checking that the retrieved stake request matches with the updated one.
    StakeRequestUtil.checkStakeRequestAgainstAttributes(
      stakeRequest as StakeRequest,
      updatedStakeRequestAttributes,
    );
  });

  it('Fails to updates a stake request that does not exist.',
    async (): Promise<void> => assert.isRejected(
      config.db.stakeRequestRepository.updateMessageHash(
        'nonExistingStakeRequestHash',
        'updatedMessageHash',
      ),
      /^Failed to update a stake request*/,
      'Update should fail as a stake request with the specified hash does not exist.',
    ));
});
