import * as sinon from 'sinon';
import BigNumber from 'bignumber.js';
import ProveGatewayService from '../../../src/services/ProveGatewayService';
import StubData from '../../utils/StubData';
import SpyAssert from '../../utils/SpyAssert';
import {
  Gateway,
  GatewayRepository,
} from '../../../src/models/GatewayRepository';
import { MessageRepository } from '../../../src/models/MessageRepository';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { assert } = chai;

const Mosaic = require('@openst/mosaic.js');
const Web3 = require('web3');

describe('ProveGatewayService.reactTo()', () => {
  const originWeb3 = new Web3();
  const auxiliaryWeb3 = new Web3();
  const auxiliaryWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const blockNumber = new BigNumber(2);

  it('should react to block height of new anchor state root', async () => {
    const gatewayRecord: Gateway = StubData.gatewayRecord();
    const gateawayRepository = sinon.createStubInstance(GatewayRepository, {
      get: Promise.resolve(gatewayRecord),
    });

    const messageRepository = sinon.createStubInstance(MessageRepository, {
      isPendingOriginMessages: Promise.resolve(true),
    });

    const proof = { encodedAccountValue: 'encodedAccountValue', serializedAccountProof: 'serializedAccountProof' };
    const proofGeneratorStub = sinon.replace(
      Mosaic.Utils.ProofGenerator.prototype,
      'getOutboxProof',
      sinon.fake.resolves(proof),
    );

    const fakeReceipt = { status: true };
    const coGatewayStub = sinon.replace(
      Mosaic.ContractInteract.EIP20CoGateway.prototype,
      'proveGateway',
      sinon.fake.resolves(fakeReceipt),
    );
    const proveGatewayService = new ProveGatewayService(
      gateawayRepository as any,
      messageRepository as any,
      originWeb3,
      auxiliaryWeb3,
      auxiliaryWorkerAddress,
      gatewayAddress,
    );

    const response = await proveGatewayService.reactTo(blockNumber);

    SpyAssert.assert(
      gateawayRepository.get,
      1,
      [[gatewayAddress]],
    );

    SpyAssert.assert(
      messageRepository.isPendingOriginMessages,
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
        proof.serializedAccountProof,
        { from: auxiliaryWorkerAddress }]],
    );

    assert.strictEqual(
      fakeReceipt,
      response.receipt,
      'Service must return expected receipt',
    );

    assert.strictEqual(
      response.success,
      true,
      'Success must be true',
    );
    assert.strictEqual(
      response.message,
      'Gateway successfully proven',
      'Service must return correct messages',
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
    );

    await assert.isRejected(
      proveGatewayService.reactTo(
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
      isPendingOriginMessages: Promise.resolve(false),
    });

    const proof = { encodedAccountValue: 'encodedAccountValue', serializedAccountProof: 'serializedAccountProof' };
    const proofGeneratorStub = sinon.replace(
      Mosaic.Utils.ProofGenerator.prototype,
      'getOutboxProof',
      sinon.fake.resolves(proof),
    );

    const fakeReceipt = { status: true };
    const coGatewayStub = sinon.replace(
      Mosaic.ContractInteract.EIP20CoGateway.prototype,
      'proveGateway',
      sinon.fake.resolves(fakeReceipt),
    );

    const proveGatewayService = new ProveGatewayService(
      gateawayRepository as any,
      messageRepository as any,
      originWeb3,
      auxiliaryWeb3,
      auxiliaryWorkerAddress,
      gatewayAddress,
    );

    const response = await proveGatewayService.reactTo(blockNumber);

    SpyAssert.assert(
      gateawayRepository.get,
      1,
      [[gatewayAddress]],
    );

    SpyAssert.assert(
      messageRepository.isPendingOriginMessages,
      1,
      [[blockNumber, gatewayAddress]],
    );

    assert.strictEqual(
      response.success,
      true,
      'Success must be true',
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
    sinon.restore();
  });
});
