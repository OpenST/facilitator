
import sinon from 'sinon';
import * as web3utils from 'web3-utils';

import MintProgressHandler from '../../../src/handlers/MintProgressHandler';
import Message from '../../../src/models/Message';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../../src/repositories/MessageRepository';
import assert from '../../test_utils/assert';
import SpyAssert from '../../test_utils/SpyAssert';

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
    const handler = new MintProgressHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
    );
    expectedModel.sender = transactions[0]._staker;
    expectedModel.direction = MessageDirection.OriginToAuxiliary;
    expectedModel.targetStatus = MessageStatus.Progressed;
    expectedModel.type = MessageType.Stake;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });

  it('should not change message state if current status is not undeclared or declared', async () => {
    const save = sinon.stub();

    const existingMessageWithProgressStatus = new Message(web3utils.keccak256('1'));
    existingMessageWithProgressStatus.targetStatus = MessageStatus.Progressed;
    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(existingMessageWithProgressStatus),
      });
    const handler = new MintProgressHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
    );
    expectedModel.targetStatus = MessageStatus.Progressed;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });
});
