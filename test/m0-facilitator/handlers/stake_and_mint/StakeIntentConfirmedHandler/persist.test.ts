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
import * as utils from 'web3-utils';

import StakeIntentConfirmedHandler from '../../../../../src/m0-facilitator/handlers/stake_and_mint/StakeIntentConfirmedHandler';
import Message from '../../../../../src/m0-facilitator/models/Message';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../../../../src/m0-facilitator/repositories/MessageRepository';
import assert from '../../../../test_utils/assert';
import SpyAssert from '../../../../test_utils/SpyAssert';
import StubData from '../../../../test_utils/StubData';

describe('StakeIntentConfirmedHandler.persist()', (): void => {
  let transactions: any = [];
  let saveStub: any;
  let messageRecord: Message;
  let message: Message;
  let sinonMessageRepositoryMock: any;
  beforeEach(async () => {
    transactions = [{
      id: '1',
      _messageHash: '0x000000000000000000000000000000000000000000000000000001',
      _staker: '0x0000000000000000000000000000000000000002',
      _stakerNonce: '1',
      type: MessageType.Stake,
      direction: MessageDirection.OriginToAuxiliary,
      secret: '1',
      gatewayAddress: '0x0000000000000000000000000000000000000001',
      sourceDeclarationBlockHeight: '1',
    }];

    saveStub = sinon.stub();
    messageRecord = StubData.messageAttributes();

    sinonMessageRepositoryMock = sinon.createStubInstance(MessageRepository, {
      save: saveStub,
      get: Promise.resolve(messageRecord),
    });
    message = StubData.messageAttributes();
    message.targetStatus = MessageStatus.Declared;
  });

  it('should persist successfully when target status is undeclared', async (): Promise<void> => {
    messageRecord.targetStatus = MessageStatus.Undeclared;

    const handler = new StakeIntentConfirmedHandler(sinonMessageRepositoryMock);

    const models = await handler.persist(transactions);

    assert.equal(
      models.length,
      transactions.length,
      'Number of models must be equal to transactions',
    );

    assert.deepStrictEqual(models[0], message);
    SpyAssert.assert(saveStub, 1, [[message]]);
  });

  it('should persist successfully when target status is undefined', async (): Promise<void> => {
    messageRecord.targetStatus = undefined as unknown as MessageStatus;

    const handler = new StakeIntentConfirmedHandler(sinonMessageRepositoryMock);

    const models = await handler.persist(transactions);

    assert.equal(
      models.length,
      transactions.length,
      'Number of models must be equal to transactions',
    );

    assert.deepStrictEqual(models[0], message);
    SpyAssert.assert(saveStub, 1, [[message]]);
  });

  it('should create new entry when message is not present', async (): Promise<void> => {
    const transaction = [{
      id: '1',
      _messageHash: '0x000000000000000000000000000000000000000000000000000001',
      _staker: '0x0000000000000000000000000000000000000002',
      _stakerNonce: new BigNumber(1),
      type: MessageType.Stake,
      direction: MessageDirection.OriginToAuxiliary,
    }];

    const save = sinon.stub();

    const mockMessageRepo = sinon.createStubInstance(MessageRepository, {
      save: save as any,
      get: Promise.resolve(null),
    });
    const handler = new StakeIntentConfirmedHandler(mockMessageRepo as any);

    const models = await handler.persist(transaction);

    const messageInstance = new Message(
      transaction[0]._messageHash,
      MessageType.Stake,
      transaction[0].direction,
      undefined,
      undefined,
      MessageStatus.Declared,
      undefined,
      undefined,
      new BigNumber(transaction[0]._stakerNonce),
      utils.toChecksumAddress(transaction[0]._staker),
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );

    assert.equal(
      models.length,
      transaction.length,
      'Number of models must be equal to transaction',
    );

    assert.deepStrictEqual(models[0], messageInstance);
    SpyAssert.assert(save, 1, [[messageInstance]]);
  });
});
