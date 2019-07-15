
import { assert } from 'chai';
import * as sinon from 'sinon';

import BigNumber from 'bignumber.js';
import SpyAssert from '../../test_utils/SpyAssert';
import {
  MessageDirection,
  MessageRepository, MessageStatus, MessageType,
} from '../../../src/repositories/MessageRepository';
import StakeIntentDeclareHandler
  from '../../../src/handlers/StakeIntentDeclareHandler';
import Message from '../../../src/models/Message';

const web3utils = require('web3-utils');

describe('StakeIntentDeclareHandler.persist()', () => {
  const transactions = [{
    _messageHash: web3utils.keccak256('1'),
    _staker: '0x0000000000000000000000000000000000000001',
    _stakerNonce: '1',
    _beneficiary: '0x0000000000000000000000000000000000000002',
    _amount: '100',
    contractAddress: '0x0000000000000000000000000000000000000002',
    blockNumber: '10',
  }];

  it('should change message state to source declared', async () => {
    const save = sinon.stub();

    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(null),
      });
    const handler = new StakeIntentDeclareHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
    );
    expectedModel.sender = transactions[0]._staker;
    expectedModel.nonce = new BigNumber(transactions[0]._stakerNonce);
    expectedModel.direction = MessageDirection.OriginToAuxiliary;
    expectedModel.sourceStatus = MessageStatus.Declared;
    expectedModel.type = MessageType.Stake;
    expectedModel.gatewayAddress = transactions[0].contractAddress;
    expectedModel.sourceDeclarationBlockHeight = new BigNumber(transactions[0].blockNumber);

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(save, 1, [[expectedModel]]);
  });

  it('should not change message state to declared if current status is not undeclared', async () => {
    const save = sinon.stub();

    const existingMessageWithProgressStatus = new Message(web3utils.keccak256('1'));
    existingMessageWithProgressStatus.sourceStatus = MessageStatus.Progressed;
    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(existingMessageWithProgressStatus),
      });
    const handler = new StakeIntentDeclareHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
    );
    expectedModel.sourceStatus = MessageStatus.Progressed;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(save, 1, [[expectedModel]]);
  });
});
