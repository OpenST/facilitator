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

import BigNumber from 'bignumber.js';
import sinon from 'sinon';
import * as web3utils from 'web3-utils';

import RedeemProgressedHandler from '../../../../src/handlers/redeem_and_unstake/RedeemProgressedHandler';
import Message from '../../../../src/models/Message';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../../../src/repositories/MessageRepository';
import assert from '../../../test_utils/assert';
import SpyAssert from '../../../test_utils/SpyAssert';

describe('ProgressRedeem.persist()', () => {
  const transactions = [{
    _messageHash: web3utils.keccak256('1'),
    _redeemer: '0x0000000000000000000000000000000000000001',
    _redeemerNonce: '1',
    _amount: '100',
    contractAddress: '0x0000000000000000000000000000000000000002',
    _proofProgress: 'false',
    _unlockSecret: web3utils.keccak256('2'),
    blockNumber: '10',
  }];

  it('should change message state to source progressed', async () => {
    const save = sinon.stub();

    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(null),
      });
    const handler = new RedeemProgressedHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    expectedModel.sender = transactions[0]._redeemer;
    expectedModel.nonce = new BigNumber(transactions[0]._redeemerNonce);
    expectedModel.sourceStatus = MessageStatus.Progressed;
    expectedModel.gatewayAddress = transactions[0].contractAddress;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(
      models.length,
      transactions.length,
      'Number of models must be equal to transactions',
    );
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });

  it('should not change message state if current status is already progressed', async () => {
    const save = sinon.stub();

    const existingMessageWithProgressedStatus = new Message(
      web3utils.keccak256('1'),
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    existingMessageWithProgressedStatus.sourceStatus = MessageStatus.Progressed;
    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(existingMessageWithProgressedStatus),
      });
    const handler = new RedeemProgressedHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    expectedModel.sourceStatus = existingMessageWithProgressedStatus.sourceStatus;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });

  it('should not change message state if current status is not undeclared/declared', async () => {
    const save = sinon.stub();

    const existingMessageWithNonUpdatableStatus = new Message(
      web3utils.keccak256('1'),
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    existingMessageWithNonUpdatableStatus.sourceStatus = MessageStatus.RevocationDeclared;
    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(existingMessageWithNonUpdatableStatus),
      });
    const handler = new RedeemProgressedHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    expectedModel.sourceStatus = existingMessageWithNonUpdatableStatus.sourceStatus;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });
});
