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
import Web3 from 'web3';
import * as web3utils from 'web3-utils';

import { interacts } from '@openst/mosaic-contracts';
import { ProofGenerator } from '@openst/mosaic-proof';

import { ORIGIN_GAS_PRICE } from '../../../../src/Constants';
import Gateway from '../../../../src/models/Gateway';
import Message from '../../../../src/models/Message';
import MessageTransferRequest from '../../../../src/models/MessageTransferRequest';
import { MessageDirection, MessageRepository } from '../../../../src/repositories/MessageRepository';
import MessageTransferRequestRepository, { RequestType } from '../../../../src/repositories/MessageTransferRequestRepository';
import ConfirmRedeemIntentService from '../../../../src/services/redeem_and_unstake/ConfirmRedeemIntentService';
import Utils from '../../../../src/Utils';
import SpyAssert from '../../../test_utils/SpyAssert';
import StubData from '../../../test_utils/StubData';
import { GatewayType } from '../../../../src/repositories/GatewayRepository';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe('ConfirmRedeemIntentService.update()', (): void => {
  const originWeb3 = new Web3(null);
  const auxiliaryWeb3 = new Web3(null);
  const originWorkerAddress = '0x0000000000000000000000000000000000000013';
  const coGatewayAddress = '0x0000000000000000000000000000000000000003';
  const remoteGatewayAddress = '0x0000000000000000000000000000000000000002';
  const messageOutBoxOffset = '7';
  let confirmRedeemIntentService: ConfirmRedeemIntentService;
  let gateway: Gateway;
  let message: Message;
  let redeemRequest: MessageTransferRequest;
  let proof: any;
  let proofGeneratorStub: any;

  beforeEach(async (): Promise<void> => {
    gateway = StubData.gatewayRecord('1234', coGatewayAddress, GatewayType.Auxiliary);
    message = StubData.messageAttributes();
    message.secret = 'secret';
    message.hashLock = web3utils.keccak256(message.secret);
    redeemRequest = StubData.getAMessageTransferRequest('requestHash', RequestType.Redeem);
    // Foreign key linking
    redeemRequest.messageHash = message.messageHash;

    proof = {
      blockNumber: gateway.lastRemoteGatewayProvenBlockHeight,
      storageProof: [{ serializedProof: 'storageProof' }],
    };
    proofGeneratorStub = sinon.replace(
      ProofGenerator.prototype,
      'getOutboxProof',
      sinon.fake.resolves(proof),
    );
  });

  it('Should react to update on gateway model ', async (): Promise<void> => {
    const messageRepository = sinon.createStubInstance(MessageRepository, {
      getMessagesForConfirmation: Promise.resolve([message]),
    });

    const messageTransferRequest = sinon.createStubInstance(MessageTransferRequestRepository, {
      getByMessageHash: Promise.resolve(redeemRequest),
    });

    const eip20GatewayMockInstance = {
      methods: {
        confirmRedeemIntent: () => {},
      },
    };

    const rawTx = 'rawTx';
    const confirmRedeemIntentSpy = sinon.replace(
      eip20GatewayMockInstance.methods,
      'confirmRedeemIntent',
      sinon.fake.returns(rawTx),
    );

    const interactsSpy = sinon.replace(
      interacts,
      'getEIP20Gateway',
      sinon.fake.returns(eip20GatewayMockInstance),
    );

    const fakeTransactionHash = 'fakeHash';
    const sendTransactionSpy = sinon.replace(
      Utils,
      'sendTransaction',
      sinon.fake.resolves(fakeTransactionHash),
    );

    const getMessageBoxOffsetSpy = sinon.replace(
      Utils,
      'getMessageBoxOffset',
      sinon.fake.resolves(messageOutBoxOffset),
    );

    confirmRedeemIntentService = new ConfirmRedeemIntentService(
      messageRepository as any,
      messageTransferRequest as any,
      originWeb3,
      auxiliaryWeb3,
      remoteGatewayAddress,
      coGatewayAddress,
      originWorkerAddress,
    );

    await confirmRedeemIntentService.update([gateway]);

    SpyAssert.assert(
      messageRepository.getMessagesForConfirmation,
      1,
      [
        [
          gateway.gatewayAddress,
          gateway.lastRemoteGatewayProvenBlockHeight,
          MessageDirection.AuxiliaryToOrigin],
      ],
    );

    SpyAssert.assert(
      getMessageBoxOffsetSpy,
      1,
      [[auxiliaryWeb3, GatewayType.Auxiliary, coGatewayAddress]],
    );

    SpyAssert.assert(
      messageTransferRequest.getByMessageHash,
      1,
      [[message.messageHash]],
    );

    SpyAssert.assert(
      proofGeneratorStub,
      1,
      [[
        gateway.gatewayAddress,
        [message.messageHash],
        gateway.lastRemoteGatewayProvenBlockHeight.toString(10),
        messageOutBoxOffset,
      ]],
    );

    const transactionOptions = {
      from: originWorkerAddress,
      gasPrice: ORIGIN_GAS_PRICE,
    };

    SpyAssert.assert(
      sendTransactionSpy,
      1,
      [[rawTx, transactionOptions, originWeb3]],
    );

    SpyAssert.assert(
      interactsSpy,
      1,
      [[originWeb3, remoteGatewayAddress]],
    );

    SpyAssert.assert(
      confirmRedeemIntentSpy,
      1,
      [[
        message.sender!,
        message.nonce!.toString(),
        redeemRequest.beneficiary,
        redeemRequest.amount.toString(),
        message.gasPrice!.toString(),
        message.gasLimit!.toString(),
        proof!.blockNumber!.toString(),
        message.hashLock!,
        proof!.storageProof[0].serializedProof,
      ]],
    );

  });

  it('Should not do confirmRedeemIntent if '
    + 'no messages available to confirm', async (): Promise<void> => {
    const messageRepository = sinon.createStubInstance(MessageRepository, {
      getMessagesForConfirmation: Promise.resolve([]),
    });

    const messageTransferRequest = sinon.createStubInstance(MessageTransferRequestRepository, {
      getByMessageHash: Promise.resolve(null),
    });


    const eip20GatewayMockInstance = {
      methods: {
        confirmRedeemIntent: () => {},
      },
    };

    const rawTx = 'rawTx';
    const confirmRedeemIntentSpy = sinon.replace(
      eip20GatewayMockInstance.methods,
      'confirmRedeemIntent',
      sinon.fake.returns(rawTx),
    );

    const interactsSpy = sinon.replace(
      interacts,
      'getEIP20Gateway',
      sinon.fake.returns(eip20GatewayMockInstance),
    );

    const fakeTransactionHash = 'fakeHash';
    const sendTransactionSpy = sinon.replace(
      Utils,
      'sendTransaction',
      sinon.fake.resolves(fakeTransactionHash),
    );

    confirmRedeemIntentService = new ConfirmRedeemIntentService(
      messageRepository as any,
      messageTransferRequest as any,
      originWeb3,
      auxiliaryWeb3,
      remoteGatewayAddress,
      coGatewayAddress,
      originWorkerAddress,
    );

    await confirmRedeemIntentService.update([gateway]);

    SpyAssert.assert(
      messageRepository.getMessagesForConfirmation,
      1,
      [
        [
          gateway.gatewayAddress,
          gateway.lastRemoteGatewayProvenBlockHeight,
          MessageDirection.AuxiliaryToOrigin,
        ],
      ],
    );

    SpyAssert.assert(
      messageTransferRequest.getByMessageHash,
      0,
      [[]],
    );

    SpyAssert.assert(
      proofGeneratorStub,
      0,
      [[
        gateway.gatewayAddress,
        [],
        gateway.lastRemoteGatewayProvenBlockHeight,
        messageOutBoxOffset,
      ]],
    );

    const transactionOptions = {
      from: originWorkerAddress,
      gasPrice: ORIGIN_GAS_PRICE,
    };

    SpyAssert.assert(
      sendTransactionSpy,
      0,
      [[rawTx, transactionOptions]],
    );

    SpyAssert.assert(
      interactsSpy,
      0,
      [[originWeb3, remoteGatewayAddress]],
    );

    SpyAssert.assert(
      confirmRedeemIntentSpy,
      0,
      [[
        message.sender!,
        message.nonce!.toString(10),
        redeemRequest.beneficiary,
        redeemRequest.amount.toString(10),
        message.gasPrice!.toString(10),
        message.gasLimit!.toString(10),
        message.hashLock!,
        proof!.blockNumber!.toString(10),
        proof.storageProof,
      ]],
    );

  });

  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

});
