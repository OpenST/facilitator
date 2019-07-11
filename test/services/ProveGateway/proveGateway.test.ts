import * as sinon from 'sinon';
import BigNumber from 'bignumber.js';
import ProveGatewayService from '../../../src/services/ProveGatewayService';
import StubData from '../../test_utils/StubData';
import SpyAssert from '../../test_utils/SpyAssert';
import GatewayRepository from '../../../src/repositories/GatewayRepository';
import { MessageRepository } from '../../../src/repositories/MessageRepository';
import Utils from '../../../src/Utils';
import { AUXILIARY_GAS_PRICE } from '../../../src/Constants';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import Gateway from "../../../src/models/Gateway";
chai.use(chaiAsPromised);
const { assert } = chai;

const Mosaic = require('@openst/mosaic.js');
const Web3 = require('web3');

describe('ProveGatewayService.proveGateway()', () => {
  const originWeb3 = new Web3();
  const auxiliaryWeb3 = new Web3();
  const auxiliaryWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const blockNumber = new BigNumber(2);
  const fakeTransactionHash = 'fakeHash';
  const auxiliaryChainId = 123;

  it('should react to block height of new anchor state root', async () => {
    const gatewayRecord: Gateway = StubData.gatewayRecord();
    const gateawayRepository = sinon.createStubInstance(GatewayRepository, {
      get: Promise.resolve(gatewayRecord),
    });

    const messageRepository = sinon.createStubInstance(MessageRepository, {
      hasPendingOriginMessages: Promise.resolve(true),
    });

    const proof = { encodedAccountValue: 'encodedAccountValue', serializedAccountProof: 'serializedAccountProof' };
    const proofGeneratorStub = sinon.replace(
      Mosaic.Utils.ProofGenerator.prototype,
      'getOutboxProof',
      sinon.fake.resolves(proof),
    );

    const fakeRawTransaction = { status: true };
    const coGatewayStub = sinon.replace(
      Mosaic.ContractInteract.EIP20CoGateway.prototype,
      'proveGatewayRawTx',
      sinon.fake.resolves(fakeRawTransaction),
    );

    const sendTransactionStub = sinon.replace(
      Utils,
      'sendTransaction',
      sinon.fake.resolves(fakeTransactionHash),
    );
    const proveGatewayService = new ProveGatewayService(
      gateawayRepository as any,
      messageRepository as any,
      originWeb3,
      auxiliaryWeb3,
      auxiliaryWorkerAddress,
      gatewayAddress,
      auxiliaryChainId,
    );

    const response = await proveGatewayService.proveGateway(blockNumber);

    SpyAssert.assert(
      gateawayRepository.get,
      1,
      [[gatewayAddress]],
    );

    SpyAssert.assert(
      messageRepository.hasPendingOriginMessages,
      1,
      [[blockNumber, gatewayAddress]],
    );

    SpyAssert.assert(
      proofGeneratorStub,
      1,
      [[gatewayRecord.gatewayAddress, [], blockNumber]],
    );

    SpyAssert.assert(
      coGatewayStub,
      1,
      [[
        blockNumber,
        proof.encodedAccountValue,
        proof.serializedAccountProof]],
    );

    SpyAssert.assert(
      sendTransactionStub,
      1,
      [[fakeRawTransaction, { from: auxiliaryWorkerAddress, gasPrice: AUXILIARY_GAS_PRICE }]],
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

    const proveGatewayService = new ProveGatewayService(
      gateawayRepository as any,
      sinon.fake() as any,
      originWeb3,
      auxiliaryWeb3,
      auxiliaryWorkerAddress,
      gatewayAddress,
      auxiliaryChainId,
    );

    await assert.isRejected(
      proveGatewayService.proveGateway(
        blockNumber,
      ),
      'Gateway record record doesnot exists for given gateway',
      'It must fail if gatway record does not exists.',
    );
    sinon.restore();
  });

  it('should not try to proveGateway if there are no pending messages', async (): Promise<void> => {
    const gatewayRecord: Gateway = StubData.gatewayRecord();
    const gateawayRepository = sinon.createStubInstance(GatewayRepository, {
      get: Promise.resolve(gatewayRecord),
    });

    const messageRepository = sinon.createStubInstance(MessageRepository, {
      hasPendingOriginMessages: Promise.resolve(false),
    });

    const fakeRawTransaction = { status: true };
    const coGatewayStub = sinon.replace(
      Mosaic.ContractInteract.EIP20CoGateway.prototype,
      'proveGatewayRawTx',
      sinon.fake.resolves(fakeRawTransaction),
    );

    const sendTransactionStub = sinon.replace(
      Utils,
      'sendTransaction',
      sinon.fake.resolves(fakeTransactionHash),
    );

    const proof = { encodedAccountValue: 'encodedAccountValue', serializedAccountProof: 'serializedAccountProof' };
    const proofGeneratorStub = sinon.replace(
      Mosaic.Utils.ProofGenerator.prototype,
      'getOutboxProof',
      sinon.fake.resolves(proof),
    );

    const proveGatewayService = new ProveGatewayService(
      gateawayRepository as any,
      messageRepository as any,
      originWeb3,
      auxiliaryWeb3,
      auxiliaryWorkerAddress,
      gatewayAddress,
      auxiliaryChainId,
    );

    const response = await proveGatewayService.proveGateway(blockNumber);

    SpyAssert.assert(
      gateawayRepository.get,
      1,
      [[gatewayAddress]],
    );

    SpyAssert.assert(
      messageRepository.hasPendingOriginMessages,
      1,
      [[blockNumber, gatewayAddress]],
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
      coGatewayStub,
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
