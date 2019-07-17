import { assert } from 'chai';
import * as sinon from 'sinon';

import BigNumber from 'bignumber.js';
import StakeIntentConfirmHandler from '../../../src/handlers/StakeIntentConfirmHandler';
import {
  MessageDirection, MessageStatus,
  MessageType, MessageRepository,
} from '../../../src/repositories/MessageRepository';
import SpyAssert from '../../test_utils/SpyAssert';
import Message from '../../../src/models/Message';
import StubData from '../../test_utils/StubData';

describe('StakeIntentConfirmHandler.persist()', (): void => {
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

    const handler = new StakeIntentConfirmHandler(sinonMessageRepositoryMock);

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

    const handler = new StakeIntentConfirmHandler(sinonMessageRepositoryMock);

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
    const handler = new StakeIntentConfirmHandler(mockMessageRepo as any);

    const models = await handler.persist(transaction);

    const messageInstance = new Message(
      transaction[0]._messageHash,
      MessageType.Stake,
      undefined,
      undefined,
      MessageStatus.Declared,
      undefined,
      undefined,
      new BigNumber(transaction[0]._stakerNonce),
      transaction[0]._staker,
      transaction[0].direction,
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
