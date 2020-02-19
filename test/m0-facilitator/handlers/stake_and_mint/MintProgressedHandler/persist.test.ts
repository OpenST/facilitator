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


import sinon from 'sinon';
import * as web3utils from 'web3-utils';

import MintProgressedHandler from '../../../../src/handlers/stake_and_mint/MintProgressedHandler';
import Message from '../../../../src/models/Message';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../../../src/repositories/MessageRepository';
import assert from '../../../test_utils/assert';
import SpyAssert from '../../../test_utils/SpyAssert';

describe('MintProgress.persist()', () => {
  const transactions = [{
    _messageHash: web3utils.keccak256('1'),
    _staker: '0x0000000000000000000000000000000000000001',
    _beneficiary: '0x0000000000000000000000000000000000000002',
    _mintedAmount: '100',
    _stakeAmount: '100',
    _rewardAmount: '100',
    contractAddress: '0x0000000000000000000000000000000000000002',
    _proofProgress: 'false',
    _unlockSecret: web3utils.keccak256('2'),
    blockNumber: '10',
  }];

  it('should change message state to target progressed', async () => {
    const save = sinon.stub();

    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(null),
      });
    const handler = new MintProgressedHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
      MessageType.Stake,
      MessageDirection.OriginToAuxiliary,
    );
    expectedModel.sender = transactions[0]._staker;
    expectedModel.targetStatus = MessageStatus.Progressed;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });

  it('should not change message state if current status is not undeclared or declared', async () => {
    const save = sinon.stub();

    const existingMessageWithProgressStatus = new Message(
      web3utils.keccak256('1'),
      MessageType.Stake,
      MessageDirection.OriginToAuxiliary,
    );
    existingMessageWithProgressStatus.targetStatus = MessageStatus.Progressed;
    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(existingMessageWithProgressStatus),
      });
    const handler = new MintProgressedHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
      MessageType.Stake,
      MessageDirection.OriginToAuxiliary,
    );
    expectedModel.targetStatus = MessageStatus.Progressed;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });
});
