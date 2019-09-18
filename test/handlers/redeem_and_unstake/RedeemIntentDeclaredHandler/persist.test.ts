
import BigNumber from 'bignumber.js';
import sinon from 'sinon';
import * as Web3Utils from 'web3-utils';

import RedeemIntentDeclaredHandler from '../../../../src/handlers/redeem_and_unstake/RedeemIntentDeclaredHandler';
import Message from '../../../../src/models/Message';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../../../src/repositories/MessageRepository';
import assert from '../../../test_utils/assert';
import SpyAssert from '../../../test_utils/SpyAssert';

describe('RedeemIntentDeclaredHandler.persist()', (): void => {
  const transactions = [{
    _messageHash: Web3Utils.keccak256('1'),
    _redeemer: '0x0000000000000000000000000000000000000001',
    _redeemerNonce: '1',
    _beneficiary: '0x0000000000000000000000000000000000000002',
    _amount: '100',
    contractAddress: '0x0000000000000000000000000000000000000002',
    blockNumber: '10',
  }];

  it('should change message source state to declared if message does not exist',
    async (): Promise<void> => {
    const save = sinon.stub();

    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(null),
      });
    const handler = new RedeemIntentDeclaredHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
    );
    expectedModel.sender = transactions[0]._redeemer;
    expectedModel.nonce = new BigNumber(transactions[0]._redeemerNonce);
    expectedModel.direction = MessageDirection.AuxiliaryToOrigin;
    expectedModel.sourceStatus = MessageStatus.Declared;
    expectedModel.type = MessageType.Redeem;
    expectedModel.gatewayAddress = transactions[0].contractAddress;
    expectedModel.sourceDeclarationBlockHeight = new BigNumber(transactions[0].blockNumber);

    assert.equal(
      models.length,
      transactions.length,
      'Number of models must be equal to transactions',
    );
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });

  it('should change message source state to Declared if message status is UnDeclared',
    async (): Promise<void> => {
      const save = sinon.stub();

      const existingMessageWithUndeclaredStatus = new Message(Web3Utils.keccak256('1'));
      existingMessageWithUndeclaredStatus.sourceStatus = MessageStatus.Undeclared;

      const mockedRepository = sinon.createStubInstance(MessageRepository,
        {
          save: save as any,
          get: Promise.resolve(existingMessageWithUndeclaredStatus),
        });
      const handler = new RedeemIntentDeclaredHandler(mockedRepository as any);

      const models = await handler.persist(transactions);

      const expectedModel = new Message(
        transactions[0]._messageHash,
      );
      expectedModel.sourceStatus = MessageStatus.Declared;
      expectedModel.sourceDeclarationBlockHeight = new BigNumber(transactions[0].blockNumber);

      assert.equal(
        models.length,
        transactions.length,
        'Number of models must be equal to transactions',
      );
      SpyAssert.assert(save, 1, [[expectedModel]]);
      SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
    });

  it('should change all messages source state to declared when input has multiple transactions',
    async (): Promise<void> => {
      const bulkTransactions = [
        {
          _messageHash: Web3Utils.keccak256('1'),
          _redeemer: '0x0000000000000000000000000000000000000001',
          _redeemerNonce: '1',
          _beneficiary: '0x0000000000000000000000000000000000000002',
          _amount: '100',
          contractAddress: '0x0000000000000000000000000000000000000002',
          blockNumber: '10',
        },
        {
          _messageHash: Web3Utils.keccak256('2'),
          _redeemer: '0x0000000000000000000000000000000000000001',
          _redeemerNonce: '1',
          _beneficiary: '0x0000000000000000000000000000000000000002',
          _amount: '100',
          contractAddress: '0x0000000000000000000000000000000000000002',
          blockNumber: '10',
        }];

      const save = sinon.stub();

      const mockedRepository = sinon.createStubInstance(MessageRepository,
        {
          save: save as any,
          get: Promise.resolve(null),
        });
      const handler = new RedeemIntentDeclaredHandler(mockedRepository as any);

      const models = await handler.persist(bulkTransactions);

      const expectedModel1 = new Message(
        bulkTransactions[0]._messageHash,
      );
      expectedModel1.sender = bulkTransactions[0]._redeemer;
      expectedModel1.nonce = new BigNumber(bulkTransactions[0]._redeemerNonce);
      expectedModel1.direction = MessageDirection.AuxiliaryToOrigin;
      expectedModel1.sourceStatus = MessageStatus.Declared;
      expectedModel1.type = MessageType.Redeem;
      expectedModel1.gatewayAddress = bulkTransactions[0].contractAddress;
      expectedModel1.sourceDeclarationBlockHeight = new BigNumber(bulkTransactions[0].blockNumber);

      const expectedModel2 = new Message(
        bulkTransactions[1]._messageHash,
      );
      expectedModel2.sender = bulkTransactions[1]._redeemer;
      expectedModel2.nonce = new BigNumber(bulkTransactions[1]._redeemerNonce);
      expectedModel2.direction = MessageDirection.AuxiliaryToOrigin;
      expectedModel2.sourceStatus = MessageStatus.Declared;
      expectedModel2.type = MessageType.Redeem;
      expectedModel2.gatewayAddress = bulkTransactions[1].contractAddress;
      expectedModel2.sourceDeclarationBlockHeight = new BigNumber(bulkTransactions[1].blockNumber);

      assert.equal(
        models.length,
        bulkTransactions.length,
        'Number of models must be equal to transactions',
      );
      SpyAssert.assert(save, 2, [[expectedModel1], [expectedModel2]]);
      SpyAssert.assert(
        mockedRepository.get,
        2,
        [[bulkTransactions[0]._messageHash], [bulkTransactions[1]._messageHash]],
      );
    });

  it('should not change message source state to Declared '
    + 'if current status is Progressed', async (): Promise<void> => {
    const save = sinon.stub();

    const existingMessageWithProgressStatus = new Message(Web3Utils.keccak256('1'));
    existingMessageWithProgressStatus.sourceStatus = MessageStatus.Progressed;
    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(existingMessageWithProgressStatus),
      });
    const handler = new RedeemIntentDeclaredHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
    );
    expectedModel.sourceStatus = MessageStatus.Progressed;

    assert.equal(
      models.length,
      transactions.length,
      'Number of models must be equal to transactions',
    );
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });

  it('should not update anything if current message state is already Declared',
    async (): Promise<void> => {
    const save = sinon.stub();

    const existingMessageWithProgressStatus = new Message(Web3Utils.keccak256('1'));
    existingMessageWithProgressStatus.sourceStatus = MessageStatus.Declared;
    const mockedRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(existingMessageWithProgressStatus),
      });
    const handler = new RedeemIntentDeclaredHandler(mockedRepository as any);

    const models = await handler.persist(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
    );
    expectedModel.sourceStatus = MessageStatus.Declared;

    assert.equal(
      models.length,
      transactions.length,
      'Number of models must be equal to transactions',
    );
    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(mockedRepository.get, 1, [[transactions[0]._messageHash]]);
  });
});
