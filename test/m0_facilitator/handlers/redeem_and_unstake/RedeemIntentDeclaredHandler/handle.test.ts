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
import * as Web3Utils from 'web3-utils';

import RedeemIntentDeclaredHandler from '../../../../../src/m0_facilitator/handlers/redeem_and_unstake/RedeemIntentDeclaredHandler';
import Message from '../../../../../src/m0_facilitator/models/Message';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../../../../src/m0_facilitator/repositories/MessageRepository';
import SpyAssert from '../../../../test_utils/SpyAssert';
import {
  default as MessageTransferRequestRepository,
  RequestType,
} from '../../../../../src/m0_facilitator/repositories/MessageTransferRequestRepository';
import StubData from '../../../../test_utils/StubData';

describe('RedeemIntentDeclaredHandler.handle()', (): void => {
  const transactions = [{
    _messageHash: Web3Utils.keccak256('1'),
    _redeemer: '0x0000000000000000000000000000000000000001',
    _redeemerNonce: '1',
    _beneficiary: '0x0000000000000000000000000000000000000002',
    _amount: '100',
    contractAddress: '0x0000000000000000000000000000000000000002',
    blockNumber: '10',
  }];
  const redeemRequest = StubData.getAMessageTransferRequest(
    'requestHash',
    RequestType.Redeem,
  );
  const saveMessageTransferRequestRepository = sinon.stub();
  let mockedMessageTransferRequestRepository = sinon.createStubInstance(
    MessageTransferRequestRepository,
    {
      getBySenderProxyNonce: Promise.resolve(redeemRequest),
      save: saveMessageTransferRequestRepository as any,
    },
  );

  afterEach((): void => {
    sinon.restore();
  });

  it('should change message source state to declared if message does not exist',
    async (): Promise<void> => {
      const save = sinon.stub();

      const mockedMessageRepository = sinon.createStubInstance(MessageRepository,
        {
          save: save as any,
          get: Promise.resolve(null),
        });
      const handler = new RedeemIntentDeclaredHandler(
        mockedMessageRepository as any,
        mockedMessageTransferRequestRepository as any,
      );

      await handler.handle(transactions);

      const expectedModel = new Message(
        transactions[0]._messageHash,
        MessageType.Redeem,
        MessageDirection.AuxiliaryToOrigin,
      );
      expectedModel.sender = transactions[0]._redeemer;
      expectedModel.nonce = new BigNumber(transactions[0]._redeemerNonce);
      expectedModel.sourceStatus = MessageStatus.Declared;
      expectedModel.gatewayAddress = transactions[0].contractAddress;
      expectedModel.sourceDeclarationBlockHeight = new BigNumber(transactions[0].blockNumber);

      SpyAssert.assert(save, 1, [[expectedModel]]);
      SpyAssert.assert(
        mockedMessageRepository.get,
        1,
        [[transactions[0]._messageHash]],
      );
      SpyAssert.assert(
        mockedMessageTransferRequestRepository.getBySenderProxyNonce,
        1,
        [[transactions[0]._redeemer, new BigNumber(transactions[0]._redeemerNonce)]],
      );
    });

  it('should change message source state to Declared if message status is UnDeclared',
    async (): Promise<void> => {
      const save = sinon.stub();

      const existingMessageWithUndeclaredStatus = new Message(
        Web3Utils.keccak256('1'),
        MessageType.Redeem,
        MessageDirection.AuxiliaryToOrigin,
      );
      existingMessageWithUndeclaredStatus.sourceStatus = MessageStatus.Undeclared;

      const mockedMessageRepository1 = sinon.createStubInstance(MessageRepository,
        {
          save: save as any,
          get: Promise.resolve(existingMessageWithUndeclaredStatus),
        });
      const handler = new RedeemIntentDeclaredHandler(
        mockedMessageRepository1 as any,
        mockedMessageTransferRequestRepository as any,
      );

      await handler.handle(transactions);

      const expectedModel = new Message(
        transactions[0]._messageHash,
        MessageType.Redeem,
        MessageDirection.AuxiliaryToOrigin,
      );
      expectedModel.sourceStatus = MessageStatus.Declared;
      expectedModel.sourceDeclarationBlockHeight = new BigNumber(transactions[0].blockNumber);

      SpyAssert.assert(save, 1, [[expectedModel]]);
      SpyAssert.assert(
        mockedMessageRepository1.get,
        1,
        [[transactions[0]._messageHash]],
      );
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

      const mockedMessageRepository = sinon.createStubInstance(MessageRepository,
        {
          save: save as any,
          get: Promise.resolve(null),
        });
      const handler = new RedeemIntentDeclaredHandler(
        mockedMessageRepository as any,
        mockedMessageTransferRequestRepository as any,
      );

      await handler.handle(bulkTransactions);

      const expectedModel1 = new Message(
        bulkTransactions[0]._messageHash,
        MessageType.Redeem,
        MessageDirection.AuxiliaryToOrigin,
      );
      expectedModel1.sender = bulkTransactions[0]._redeemer;
      expectedModel1.nonce = new BigNumber(bulkTransactions[0]._redeemerNonce);
      expectedModel1.sourceStatus = MessageStatus.Declared;
      expectedModel1.gatewayAddress = bulkTransactions[0].contractAddress;
      expectedModel1.sourceDeclarationBlockHeight = new BigNumber(bulkTransactions[0].blockNumber);

      const expectedModel2 = new Message(
        bulkTransactions[1]._messageHash,
        MessageType.Redeem,
        MessageDirection.AuxiliaryToOrigin,
      );
      expectedModel2.sender = bulkTransactions[1]._redeemer;
      expectedModel2.nonce = new BigNumber(bulkTransactions[1]._redeemerNonce);
      expectedModel2.sourceStatus = MessageStatus.Declared;
      expectedModel2.gatewayAddress = bulkTransactions[1].contractAddress;
      expectedModel2.sourceDeclarationBlockHeight = new BigNumber(bulkTransactions[1].blockNumber);

      SpyAssert.assert(save, 2, [[expectedModel1], [expectedModel2]]);
      SpyAssert.assert(
        mockedMessageRepository.get,
        2,
        [[bulkTransactions[0]._messageHash], [bulkTransactions[1]._messageHash]],
      );
    });

  it('should not change message source state to Declared '
    + 'if current status is Progressed', async (): Promise<void> => {
    const save = sinon.stub();

    const existingMessageWithProgressStatus = new Message(
      Web3Utils.keccak256('1'),
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    existingMessageWithProgressStatus.sourceStatus = MessageStatus.Progressed;
    const mockedMessageRepository = sinon.createStubInstance(MessageRepository,
      {
        save: save as any,
        get: Promise.resolve(existingMessageWithProgressStatus),
      });
    const handler = new RedeemIntentDeclaredHandler(
      mockedMessageRepository as any,
      mockedMessageTransferRequestRepository as any,
    );

    await handler.handle(transactions);

    const expectedModel = new Message(
      transactions[0]._messageHash,
      MessageType.Redeem,
      MessageDirection.AuxiliaryToOrigin,
    );
    expectedModel.sourceStatus = MessageStatus.Progressed;

    SpyAssert.assert(save, 1, [[expectedModel]]);
    SpyAssert.assert(
      mockedMessageRepository.get,
      1,
      [[transactions[0]._messageHash]],
    );
  });

  it('should not update anything if current message state is already Declared',
    async (): Promise<void> => {
      const save = sinon.stub();

      const existingMessageWithProgressStatus = new Message(
        Web3Utils.keccak256('1'),
        MessageType.Redeem,
        MessageDirection.AuxiliaryToOrigin,
      );
      existingMessageWithProgressStatus.sourceStatus = MessageStatus.Declared;
      const mockedMessageRepository = sinon.createStubInstance(MessageRepository,
        {
          save: save as any,
          get: Promise.resolve(existingMessageWithProgressStatus),
        });
      const handler = new RedeemIntentDeclaredHandler(
        mockedMessageRepository as any,
        mockedMessageTransferRequestRepository as any,
      );

      await handler.handle(transactions);

      const expectedModel = new Message(
        transactions[0]._messageHash,
        MessageType.Redeem,
        MessageDirection.AuxiliaryToOrigin,
      );
      expectedModel.sourceStatus = MessageStatus.Declared;

      SpyAssert.assert(save, 1, [[expectedModel]]);
      SpyAssert.assert(
        mockedMessageRepository.get,
        1,
        [[transactions[0]._messageHash]],
      );
    });

  it('should update messageHash in messageTransferRequestRepository',
    async (): Promise<void> => {
      const messageSave = sinon.stub();
      const mockedMessageRepository = sinon.createStubInstance(MessageRepository,
        {
          save: messageSave as any,
          get: Promise.resolve(null),
        });

      // Sync stakeRequest with message model
      redeemRequest.senderProxy = transactions[0]._redeemer;
      redeemRequest.nonce = new BigNumber(transactions[0]._redeemerNonce);
      redeemRequest.messageHash = null;
      const redeemRequestSave = sinon.stub();
      mockedMessageTransferRequestRepository = sinon.createStubInstance(
        MessageTransferRequestRepository,
        {
          getBySenderProxyNonce: Promise.resolve(redeemRequest),
          save: redeemRequestSave as any,
        },
      );

      const handler = new RedeemIntentDeclaredHandler(
        mockedMessageRepository as any,
        mockedMessageTransferRequestRepository as any,
      );

      await handler.handle(transactions);

      const expectedMessageModel = new Message(
        transactions[0]._messageHash,
        MessageType.Redeem,
        MessageDirection.AuxiliaryToOrigin,
      );
      expectedMessageModel.sender = transactions[0]._redeemer;
      expectedMessageModel.nonce = new BigNumber(transactions[0]._redeemerNonce);
      expectedMessageModel.sourceStatus = MessageStatus.Declared;
      expectedMessageModel.gatewayAddress = transactions[0].contractAddress;
      expectedMessageModel.sourceDeclarationBlockHeight = new BigNumber(
        transactions[0].blockNumber,
      );

      // Validate message models
      SpyAssert.assert(mockedMessageRepository.get, 1, [[transactions[0]._messageHash]]);
      SpyAssert.assert(messageSave, 1, [[expectedMessageModel]]);

      // Validate redeemRequest models
      redeemRequest.messageHash = expectedMessageModel.messageHash;
      SpyAssert.assert(
        mockedMessageTransferRequestRepository.getBySenderProxyNonce,
        1,
        [[transactions[0]._redeemer, new BigNumber(transactions[0]._redeemerNonce)]],
      );
      SpyAssert.assert(redeemRequestSave, 1, [[redeemRequest]]);
    });

  it('should not update messageHash in messageTransferRequestRepository when redeemRequest is'
    + ' undefined',
  async (): Promise<void> => {
    const messageSave = sinon.stub();
    const mockedMessageRepository = sinon.createStubInstance(MessageRepository,
      {
        save: messageSave as any,
        get: Promise.resolve(null),
      });

    const redeemRequestSave = sinon.stub();
    mockedMessageTransferRequestRepository = sinon.createStubInstance(
      MessageTransferRequestRepository,
      {
        getBySenderProxyNonce: Promise.resolve(null),
        save: redeemRequestSave as any,
      },
    );

    const handler = new RedeemIntentDeclaredHandler(
      mockedMessageRepository as any,
      mockedMessageTransferRequestRepository as any,
    );
    await handler.handle(transactions);

    SpyAssert.assert(
      mockedMessageTransferRequestRepository.getBySenderProxyNonce,
      1,
      [[transactions[0]._redeemer, new BigNumber(transactions[0]._redeemerNonce)]],
    );
    SpyAssert.assert(redeemRequestSave, 0, [[]]);
  });
});
