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

import UnstakeProgressedHandler from '../../../../../src/m0-facilitator/handlers/redeem_and_unstake/UnstakeProgressedHandler';
import Message from '../../../../../src/m0-facilitator/models/Message';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../../../../src/m0-facilitator/repositories/MessageRepository';
import assert from '../../../test_utils/assert';
import SpyAssert from '../../../test_utils/SpyAssert';

describe('ProgressUnstake.persist()', () => {
  const transactions = [{
    _messageHash: web3utils.keccak256('1'),
    _redeemer: '0x0000000000000000000000000000000000000001',
    _beneficiary: '0x0000000000000000000000000000000000000002',
    _redeemAmount: '100',
    _unstakeAmount: '400',
    _rewardAmount: '50',
    contractAddress: '0x0000000000000000000000000000000000000003',
    _proofProgress: 'false',
    _unlockSecret: web3utils.keccak256('2'),
    blockNumber: '10',
  }];

  it('should change message state to progressed', async () => {
    const save = sinon.stub();

    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: Promise.resolve(save as any),
        get: Promise.resolve(null),
      });
    const handler = new UnstakeProgressedHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    expectedModel.sender = transactions[0]._redeemer;
    expectedModel.targetStatus = MessageStatus.Progressed;
    expectedModel.gatewayAddress = transactions[0].contractAddress;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(mockedRepository.save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });

  it('should not change message record state if current status is already progressed', async () => {
    const save = sinon.stub();

    const existingMessageWithProgressStatus = new Message(
      web3utils.keccak256('1'),
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    existingMessageWithProgressStatus.targetStatus = MessageStatus.Progressed;
    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: Promise.resolve(save as any),
        get: Promise.resolve(existingMessageWithProgressStatus),
      });
    const handler = new UnstakeProgressedHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    expectedModel.targetStatus = MessageStatus.Progressed;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(mockedRepository.save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });

  it('should not change message record state if current status is not Declared', async () => {
    const save = sinon.stub();

    const existingMessageWithProgressStatus = new Message(
      web3utils.keccak256('1'),
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    existingMessageWithProgressStatus.targetStatus = MessageStatus.RevocationDeclared;
    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: Promise.resolve(save as any),
        get: Promise.resolve(existingMessageWithProgressStatus),
      });
    const handler = new UnstakeProgressedHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    expectedModel.targetStatus = existingMessageWithProgressStatus.targetStatus;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(mockedRepository.save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });
});
