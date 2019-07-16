import * as sinon from 'sinon';
import { interacts } from '@openst/mosaic-contracts';
import ConfirmStakeIntentService from '../../../src/services/ConfirmStakeIntentService';
import StubData from '../../test_utils/StubData';
import SpyAssert from '../../test_utils/SpyAssert';
import Message from '../../../src/models/Message';
import { MessageRepository } from '../../../src/repositories/MessageRepository';
import Utils from '../../../src/Utils';
import Gateway from '../../../src/models/Gateway';
import StakeRequest from '../../../src/models/StakeRequest';
import StakeRequestRepository from '../../../src/repositories/StakeRequestRepository';
import { AUXILIARY_GAS_PRICE } from '../../../src/Constants';

const Mosaic = require('@openst/mosaic.js');
const Web3 = require('web3');

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe('ConfirmStakeIntentService.update()', () => {
  const originWeb3 = new Web3();
  const auxiliaryWeb3 = new Web3();
  const auxiliaryWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const coGatewayAddress = '0x0000000000000000000000000000000000000002';
  let confirmStakeIntentService: ConfirmStakeIntentService;
  let gateway: Gateway;
  let message: Message;
  let stakeRequest: StakeRequest;
  let proof: any;
  let proofGeneratorStub: any;

  beforeEach(async (): Promise<void> => {
    gateway = StubData.gatewayRecord();
    message = StubData.messageAttributes();
    stakeRequest = StubData.getAStakeRequest('stakeRequestHash');
    // Foreign key linking
    stakeRequest.messageHash = message.messageHash;

    proof = {
      blockNumber: gateway.lastRemoteGatewayProvenBlockHeight,
      storageProof: ['storageProof'],
    };
    proofGeneratorStub = sinon.replace(
      Mosaic.Utils.ProofGenerator.prototype,
      'getOutboxProof',
      sinon.fake.resolves(proof),
    );
  });

  it('Should react to update on gateway model ', async () => {
    const messageRepository = sinon.createStubInstance(MessageRepository, {
      getMessagesForConfirmation: Promise.resolve([message]),
    });

    const stakeRequestRepository = sinon.createStubInstance(StakeRequestRepository, {
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
      stakeRequestRepository as any,
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
      [[gateway.gatewayAddress, gateway.lastRemoteGatewayProvenBlockHeight]],
    );

    SpyAssert.assert(
      stakeRequestRepository.getByMessageHash,
      1,
      [[message.messageHash]],
    );

    SpyAssert.assert(
      proofGeneratorStub,
      1,
      [[gateway.gatewayAddress, [message.messageHash], gateway.lastRemoteGatewayProvenBlockHeight]],
    );

    const transactionOptions = {
      from: auxiliaryWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };

    SpyAssert.assert(
      sendTransactionSpy,
      1,
      [[rawTx, transactionOptions]],
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
        proof.storageProof,
      ]],
    );

    sinon.restore();
  });

  it('Should not do confirmStakeIntent if no messages available to confirm', async () => {
    const messageRepository = sinon.createStubInstance(MessageRepository, {
      getMessagesForConfirmation: Promise.resolve([]),
    });

    const stakeRequestRepository = sinon.createStubInstance(StakeRequestRepository, {
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
      stakeRequestRepository as any,
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
      [[gateway.gatewayAddress, gateway.lastRemoteGatewayProvenBlockHeight]],
    );

    SpyAssert.assert(
      stakeRequestRepository.getByMessageHash,
      0,
      [[]],
    );

    SpyAssert.assert(
      proofGeneratorStub,
      0,
      [[gateway.gatewayAddress, [], gateway.lastRemoteGatewayProvenBlockHeight]],
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
        message.nonce!.toString(),
        stakeRequest.beneficiary!,
        stakeRequest.amount!.toString(),
        message.gasPrice!.toString(),
        message.gasLimit!.toString(),
        message.hashLock!,
        proof!.blockNumber!.toString(),
        proof.storageProof,
      ]],
    );

    sinon.restore();
  });
});
