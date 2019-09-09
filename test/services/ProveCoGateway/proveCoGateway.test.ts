import BigNumber from 'bignumber.js';
import sinon from 'sinon';
import Web3 from 'web3';

import { interacts } from '@openst/mosaic-contracts';
import { ProofGenerator } from '@openst/mosaic-proof';

import {ORIGIN_GAS_PRICE} from '../../../src/Constants';
import Gateway from '../../../src/models/Gateway';
import GatewayRepository from '../../../src/repositories/GatewayRepository';
import {MessageDirection, MessageRepository} from '../../../src/repositories/MessageRepository';
import ProveCoGatewayService from '../../../src/services/redeem_and_unstake/ProveCoGatewayService';
import Utils from '../../../src/Utils';
import assert from '../../test_utils/assert';
import SpyAssert from '../../test_utils/SpyAssert';
import StubData from '../../test_utils/StubData';

describe('ProveCoGatewayService.proveCoGateway()', (): void => {
  const originWeb3 = new Web3(null);
  const auxiliaryWeb3 = new Web3(null);
  const originWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const coGatewayAddress = '0x0000000000000000000000000000000000000001';
  const blockNumber = new BigNumber(2);
  const fakeTransactionHash = 'fakeHash';
  const auxiliaryChainId = 123;

  it('should react to block height of new anchor state root', async (): Promise<void> => {
    const gatewayRecord: Gateway = StubData.gatewayRecord();
    const gatewayRepository = sinon.createStubInstance(GatewayRepository, {
      get: Promise.resolve(gatewayRecord),
    });

    const messageRepository = sinon.createStubInstance(MessageRepository, {
      getMessagesForConfirmation: Promise.resolve([StubData.messageAttributes()]),
    });

    const proof = {
      encodedAccountValue: 'encodedAccountValue',
      serializedAccountProof: 'serializedAccountProof',
    };

    const proofGeneratorStub = sinon.replace(
      ProofGenerator.prototype,
      'getOutboxProof',
      sinon.fake.resolves(proof),
    );

    const fakeRawTransaction = { status: true };

    const fakeEIP20Gateway = {
      methods: {
        proveGateway: sinon.fake.returns(fakeRawTransaction),
      },
    };

    sinon.replace(
      interacts,
      'getEIP20Gateway',
      sinon.fake.returns(fakeEIP20Gateway),
    );

    const sendTransactionStub = sinon.replace(
      Utils,
      'sendTransaction',
      sinon.fake.resolves(fakeTransactionHash),
    );

    const proveCoGatewayService = new ProveCoGatewayService(
      gatewayRepository as any,
      messageRepository as any,
      originWeb3,
      auxiliaryWeb3,
      originWorkerAddress,
      coGatewayAddress,
      auxiliaryChainId,
    );

    const response = await proveCoGatewayService.proveCoGateway(blockNumber);

    SpyAssert.assert(
      gatewayRepository.get,
      1,
      [[coGatewayAddress]],
    );

    SpyAssert.assert(
      messageRepository.getMessagesForConfirmation,
      1,
      [[coGatewayAddress, blockNumber, MessageDirection.AuxiliaryToOrigin]],
    );

    SpyAssert.assert(
      proofGeneratorStub,
      1,
      [[gatewayRecord.gatewayAddress, [], blockNumber.toString(10)]],
    );

    SpyAssert.assert(
      fakeEIP20Gateway.methods.proveGateway,
      1,
      [[
        blockNumber.toString(10),
        proof.encodedAccountValue,
        proof.serializedAccountProof]],
    );

    SpyAssert.assert(
      sendTransactionStub,
      1,
      [[fakeRawTransaction, { from: originWorkerAddress, gasPrice: ORIGIN_GAS_PRICE }, originWeb3]],
    );

    assert.strictEqual(
      response.message,
      'Gateway successfully proven',
      'Service must return correct messages',
    );
    assert.strictEqual(
      response.transactionHash,
      fakeTransactionHash,
      'Service must return expected transaction hash',
    );

    sinon.restore();
  });

  it('should fail to react if gateway details does not exists', async (): Promise<void> => {
    const gateawayRepository = sinon.createStubInstance(GatewayRepository, {
      get: Promise.resolve(null),
    });

    const proveGatewayService = new ProveCoGatewayService(
      gateawayRepository as any,
      sinon.fake() as any,
      originWeb3,
      auxiliaryWeb3,
      originWorkerAddress,
      coGatewayAddress,
      auxiliaryChainId,
    );

    await assert.isRejected(
      proveGatewayService.proveCoGateway(
        blockNumber,
      ),
      'Gateway record does not exist for given gateway',
      'It must fail if gateway record does not exists.',
    );
    sinon.restore();
  });

  it('should not try to proveGateway if there are no pending messages', async (): Promise<void> => {
    const gatewayRecord: Gateway = StubData.gatewayRecord();
    const gateawayRepository = sinon.createStubInstance(GatewayRepository, {
      get: Promise.resolve(gatewayRecord),
    });

    const messageRepository = sinon.createStubInstance(MessageRepository, {
      getMessagesForConfirmation: Promise.resolve([]),
    });

    const proof = {
      encodedAccountValue: 'encodedAccountValue',
      serializedAccountProof: 'serializedAccountProof',
    };

    const proofGeneratorStub = sinon.replace(
      ProofGenerator.prototype,
      'getOutboxProof',
      sinon.fake.resolves(proof),
    );

    const fakeRawTransaction = { status: true };

    const fakeEIP20Gateway = {
      methods: {
        proveGateway: sinon.fake.returns(fakeRawTransaction),
      },
    };

    sinon.replace(
      interacts,
      'getEIP20Gateway',
      sinon.fake.returns(fakeEIP20Gateway),
    );

    const sendTransactionStub = sinon.replace(
      Utils,
      'sendTransaction',
      sinon.fake.resolves(fakeTransactionHash),
    );

    const proveGatewayService = new ProveCoGatewayService(
      gateawayRepository as any,
      messageRepository as any,
      originWeb3,
      auxiliaryWeb3,
      originWorkerAddress,
      coGatewayAddress,
      auxiliaryChainId,
    );

    const response = await proveGatewayService.proveCoGateway(blockNumber);

    SpyAssert.assert(
      gateawayRepository.get,
      1,
      [[coGatewayAddress]],
    );

    SpyAssert.assert(
      messageRepository.getMessagesForConfirmation,
      1,
      [[coGatewayAddress, blockNumber, MessageDirection.AuxiliaryToOrigin]],
    );

    assert.strictEqual(
      response.message,
      'There are no pending messages for this gateway.',
      'Service must return correct messages',
    );
    SpyAssert.assert(
      proofGeneratorStub,
      0,
      [],
    );

    SpyAssert.assert(
      fakeEIP20Gateway.methods.proveGateway,
      0,
      [],
    );

    SpyAssert.assert(
      sendTransactionStub,
      0,
      [],
    );
    sinon.restore();
  });
});
