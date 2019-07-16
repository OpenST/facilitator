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

  beforeEach(async (): Promise<void> => {
    gateway = StubData.gatewayRecord();
    message = StubData.messageAttributes();
    stakeRequest = StubData.getAStakeRequest('stakeRequestHash');
    // Foreign key linking
    stakeRequest.messageHash = message.messageHash;
  });

  it('Should react to update on gateway model ', async () => {
    const messageRepository = sinon.createStubInstance(MessageRepository, {
      getMessagesForConfirmation: Promise.resolve([message]),
    });

    const stakeRequestRepository = sinon.createStubInstance(StakeRequestRepository, {
      getByMessageHash: Promise.resolve(stakeRequest),
    });

    const proof = {
      blockNumber: gateway.lastRemoteGatewayProvenBlockHeight,
      storageProof: ['storageProof'],
    };
    const proofGeneratorStub = sinon.replace(
      Mosaic.Utils.ProofGenerator.prototype,
      'getOutboxProof',
      sinon.fake.resolves(proof),
    );

    const rawTx = 'rawTx';
    const eip20CoGatewayMockObject = {
      methods: {
        confirmStakeIntent: sinon.fake.resolves(rawTx),
      },
    };
    sinon.replace(
      interacts,
      'getEIP20CoGateway',
      () => eip20CoGatewayMockObject as any,
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

    sinon.restore();
  });

  it('Should not do confirmStakeIntent if no messages available to confirm', async () => {
    const messageRepository = sinon.createStubInstance(MessageRepository, {
      getMessagesForConfirmation: Promise.resolve([]),
    });

    const stakeRequestRepository = sinon.createStubInstance(StakeRequestRepository, {
      getByMessageHash: Promise.resolve(null),
    });

    const proof = {
      blockNumber: gateway.lastRemoteGatewayProvenBlockHeight,
      storageProof: ['storageProof'],
    };
    const proofGeneratorStub = sinon.replace(
      Mosaic.Utils.ProofGenerator.prototype,
      'getOutboxProof',
      sinon.fake.resolves(proof),
    );

    const rawTx = 'rawTx';
    const eip20CoGatewayMockObject = {
      methods: {
        confirmStakeIntent: sinon.fake.resolves(rawTx),
      },
    };
    sinon.replace(
      interacts,
      'getEIP20CoGateway',
      () => eip20CoGatewayMockObject as any,
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

    sinon.restore();
  });
});
