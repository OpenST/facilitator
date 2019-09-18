import sinon from 'sinon';
import Web3 from 'web3';
import * as web3utils from 'web3-utils';

import { interacts } from '@openst/mosaic-contracts';
import { ProofGenerator } from '@openst/mosaic-proof';

import { AUXILIARY_GAS_PRICE } from '../../../../src/Constants';
import Gateway from '../../../../src/models/Gateway';
import Message from '../../../../src/models/Message';
import MessageTransferRequest from '../../../../src/models/MessageTransferRequest';
import { MessageDirection, MessageRepository } from '../../../../src/repositories/MessageRepository';
import MessageTransferRequestRepository from '../../../../src/repositories/MessageTransferRequestRepository';
import ConfirmStakeIntentService from '../../../../src/services/stake_and_mint/ConfirmStakeIntentService';
import Utils from '../../../../src/Utils';
import SpyAssert from '../../../test_utils/SpyAssert';
import StubData from '../../../test_utils/StubData';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe('ConfirmStakeIntentService.update()', (): void => {
  const originWeb3 = new Web3(null);
  const auxiliaryWeb3 = new Web3(null);
  const auxiliaryWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const coGatewayAddress = '0x0000000000000000000000000000000000000002';
  const messageOutBoxOffset = '7';
  let confirmStakeIntentService: ConfirmStakeIntentService;
  let gateway: Gateway;
  let message: Message;
  let stakeRequest: MessageTransferRequest;
  let proof: any;
  let proofGeneratorStub: any;

  beforeEach(async (): Promise<void> => {
    gateway = StubData.gatewayRecord();
    message = StubData.messageAttributes();
    message.secret = 'secret';
    message.hashLock = web3utils.keccak256(message.secret);
    stakeRequest = StubData.getAStakeRequest('requestHash');
    // Foreign key linking
    stakeRequest.messageHash = message.messageHash;

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

    const messageTransferRequestRepository = sinon.createStubInstance(MessageTransferRequestRepository, {
      getByMessageHash: Promise.resolve(stakeRequest),
    });

    const eip20CoGatewayMockInstance = {
      methods: {
        confirmStakeIntent: () => {},
      },
    };

    const rawTx = 'rawTx';
    const confirmStakeIntentSpy = sinon.replace(
      eip20CoGatewayMockInstance.methods,
      'confirmStakeIntent',
      sinon.fake.returns(rawTx),
    );

    const interactsSpy = sinon.replace(
      interacts,
      'getEIP20CoGateway',
      sinon.fake.returns(eip20CoGatewayMockInstance),
    );

    const fakeTransactionHash = 'fakeHash';
    const sendTransactionSpy = sinon.replace(
      Utils,
      'sendTransaction',
      sinon.fake.resolves(fakeTransactionHash),
    );

    confirmStakeIntentService = new ConfirmStakeIntentService(
      messageRepository as any,
      messageTransferRequestRepository as any,
      originWeb3,
      auxiliaryWeb3,
      gatewayAddress,
      coGatewayAddress,
      auxiliaryWorkerAddress,
    );

    await confirmStakeIntentService.update([gateway]);

    SpyAssert.assert(
      messageRepository.getMessagesForConfirmation,
      1,
      [
        [
          gateway.gatewayAddress,
          gateway.lastRemoteGatewayProvenBlockHeight,
          MessageDirection.OriginToAuxiliary],
      ],
    );

    SpyAssert.assert(
      messageTransferRequestRepository.getByMessageHash,
      1,
      [[message.messageHash]],
    );

    SpyAssert.assert(
      proofGeneratorStub,
      1,
      [[
        gateway.gatewayAddress,
        [message.messageHash],
        gateway.lastRemoteGatewayProvenBlockHeight!.toString(10),
        messageOutBoxOffset,
      ]],
    );

    const transactionOptions = {
      from: auxiliaryWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };

    SpyAssert.assert(
      sendTransactionSpy,
      1,
      [[rawTx, transactionOptions, auxiliaryWeb3]],
    );

    SpyAssert.assert(
      interactsSpy,
      1,
      [[auxiliaryWeb3, coGatewayAddress]],
    );

    SpyAssert.assert(
      confirmStakeIntentSpy,
      1,
      [[
        message.sender!,
        message.nonce!.toString(),
        stakeRequest.beneficiary!,
        stakeRequest.amount!.toString(),
        message.gasPrice!.toString(),
        message.gasLimit!.toString(),
        message.hashLock!,
        proof!.blockNumber!.toString(),
        proof!.storageProof[0].serializedProof,
      ]],
    );

    sinon.restore();
  });

  it('Should not do confirmStakeIntent if '
    + 'no messages available to confirm', async (): Promise<void> => {
    const messageRepository = sinon.createStubInstance(MessageRepository, {
      getMessagesForConfirmation: Promise.resolve([]),
    });

    const messageTransferRequestRepository = sinon.createStubInstance(MessageTransferRequestRepository, {
      getByMessageHash: Promise.resolve(null),
    });


    const eip20CoGatewayMockInstance = {
      methods: {
        confirmStakeIntent: () => {},
      },
    };

    const rawTx = 'rawTx';
    const confirmStakeIntentSpy = sinon.replace(
      eip20CoGatewayMockInstance.methods,
      'confirmStakeIntent',
      sinon.fake.returns(rawTx),
    );

    const interactsSpy = sinon.replace(
      interacts,
      'getEIP20CoGateway',
      sinon.fake.returns(eip20CoGatewayMockInstance),
    );

    const fakeTransactionHash = 'fakeHash';
    const sendTransactionSpy = sinon.replace(
      Utils,
      'sendTransaction',
      sinon.fake.resolves(fakeTransactionHash),
    );

    confirmStakeIntentService = new ConfirmStakeIntentService(
      messageRepository as any,
      messageTransferRequestRepository as any,
      originWeb3,
      auxiliaryWeb3,
      gatewayAddress,
      coGatewayAddress,
      auxiliaryWorkerAddress,
    );

    await confirmStakeIntentService.update([gateway]);

    SpyAssert.assert(
      messageRepository.getMessagesForConfirmation,
      1,
      [
        [
          gateway.gatewayAddress,
          gateway.lastRemoteGatewayProvenBlockHeight,
          MessageDirection.OriginToAuxiliary,
        ],
      ],
    );

    SpyAssert.assert(
      messageTransferRequestRepository.getByMessageHash,
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
      from: auxiliaryWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };

    SpyAssert.assert(
      sendTransactionSpy,
      0,
      [[rawTx, transactionOptions]],
    );

    SpyAssert.assert(
      interactsSpy,
      0,
      [[auxiliaryWeb3, coGatewayAddress]],
    );

    SpyAssert.assert(
      confirmStakeIntentSpy,
      0,
      [[
        message.sender!,
        message.nonce!.toString(10),
        stakeRequest.beneficiary!,
        stakeRequest.amount!.toString(10),
        message.gasPrice!.toString(10),
        message.gasLimit!.toString(10),
        message.hashLock!,
        proof!.blockNumber!.toString(10),
        proof.storageProof,
      ]],
    );

    sinon.restore();
  });
});
