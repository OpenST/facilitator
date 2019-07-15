
import { assert } from 'chai';
import * as sinon from 'sinon';

import BigNumber from 'bignumber.js';
import SpyAssert from '../../test_utils/SpyAssert';
import {
  MessageDirection,
  MessageRepository, MessageStatus, MessageType,
} from '../../../src/repositories/MessageRepository';
import Message from '../../../src/models/Message';
import StakeProgressHandler from '../../../src/handlers/StakeProgressHandler';


const web3utils = require('web3-utils');

describe('ProgressStake.persist()', () => {
  const transactions = [{
    _messageHash: web3utils.keccak256('1'),
    _staker: '0x0000000000000000000000000000000000000001',
    _stakerNonce: '1',
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
    const handler = new StakeProgressHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
    );
    expectedModel.sender = transactions[0]._staker;
    expectedModel.nonce = new BigNumber(transactions[0]._stakerNonce);
    expectedModel.direction = MessageDirection.OriginToAuxiliary;
    expectedModel.sourceStatus = MessageStatus.Progressed;
    expectedModel.type = MessageType.Stake;
    expectedModel.gatewayAddress = transactions[0].contractAddress;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });

  it('should not change message state if current status is not undeclared or declared', async () => {
    const save = sinon.stub();

    const existingMessageWithProgressStatus = new Message(web3utils.keccak256('1'));
    existingMessageWithProgressStatus.sourceStatus = MessageStatus.Progressed;
    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(existingMessageWithProgressStatus),
      });
    const handler = new StakeProgressHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
    );
    expectedModel.sourceStatus = MessageStatus.Progressed;
    expectedModel.secret = transactions[0]._unlockSecret;

    assert.equal(models.length, transactions.length, 'Number of models must be equal to transactions');
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });
});
