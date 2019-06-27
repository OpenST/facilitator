import * as sinon from 'sinon';
import ProveGatewayService from '../../../src/services/ProveGatewayService';
import { AuxiliaryChainRepository } from '../../../src/models/AuxiliaryChainRepository';
import StubData from '../../utils/StubData';
import SpyAssert from '../../utils/SpyAssert';

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

  it('should react to auxiliary chainId', async () => {
    const auxiliaryChainRecord = StubData.auxiliaryChainRecord();
    const auxilaryChainRepository = sinon.createStubInstance(AuxiliaryChainRepository, {
      get: Promise.resolve(auxiliaryChainRecord),
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
      auxilaryChainRepository as any,
      originWeb3,
      auxiliaryWeb3,
      auxiliaryWorkerAddress,
    );

    const auxiliaryChainId = 1;
    const receipt = await proveGatewayService.reactTo(auxiliaryChainId);

    SpyAssert.assert(
      auxilaryChainRepository.get,
      1,
      [[auxiliaryChainId]],
    );

    SpyAssert.assert(
      proofGeneratorStub,
      1,
      [[auxiliaryChainRecord.ostGatewayAddress, [], auxiliaryChainRecord.lastOriginBlockHeight]],
    );

    SpyAssert.assert(
      coGatewayStub,
      1,
      [[
        auxiliaryChainRecord.lastOriginBlockHeight,
        proof.encodedAccountValue,
        proof.serializedAccountProof,
        { from: auxiliaryWorkerAddress }]],
    );

    assert.strictEqual(
      fakeReceipt,
      receipt,
      'Service must return expected receipt',
    );
  });

  it('should fail to react if auxiliary chain details does not exists', async (): Promise<void> => {
    const auxilaryChainRepository = sinon.createStubInstance(AuxiliaryChainRepository, {
      get: Promise.resolve(null),
    });

    const proveGatewayService = new ProveGatewayService(
      auxilaryChainRepository as any,
      originWeb3,
      auxiliaryWeb3,
      auxiliaryWorkerAddress,
    );

    await assert.isRejected(
      proveGatewayService.reactTo(
        1,
      ),
      'Auxiliary chain record doesnot exists for given chainId',
      'It must fail if auxiliary chain details does not exists.',
    );
  });
});
