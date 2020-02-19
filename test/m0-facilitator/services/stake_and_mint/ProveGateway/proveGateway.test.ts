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
import Web3 from 'web3';

import { interacts } from '@openst/mosaic-contracts';
import { ProofGenerator } from '@openst/mosaic-proof';

import { AUXILIARY_GAS_PRICE } from '../../../../../src/m0-facilitator/Constants';
import Gateway from '../../../../../src/m0-facilitator/models/Gateway';
import GatewayRepository from '../../../../../src/m0-facilitator/repositories/GatewayRepository';
import { MessageDirection, MessageRepository } from '../../../../../src/m0-facilitator/repositories/MessageRepository';
import ProveGatewayService from '../../../../../src/m0-facilitator/services/stake_and_mint/ProveGatewayService';
import Utils from '../../../../../src/m0-facilitator/Utils';
import assert from '../../../../test_utils/assert';
import SpyAssert from '../../../../test_utils/SpyAssert';
import StubData from '../../../../test_utils/StubData';

describe('ProveGatewayService.proveGateway()', (): void => {
  const originWeb3 = new Web3(null);
  const auxiliaryWeb3 = new Web3(null);
  const auxiliaryWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const blockNumber = new BigNumber(2);
  const fakeTransactionHash = 'fakeHash';
  const auxiliaryChainId = 123;

  it('should react to block height of new anchor state root', async (): Promise<void> => {
    const gatewayRecord: Gateway = StubData.gatewayRecord();
    const gateawayRepository = sinon.createStubInstance(GatewayRepository, {
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

    const fakeEIP20CoGateway = {
      methods: {
        proveGateway: sinon.fake.returns(fakeRawTransaction),
      },
    };

    sinon.replace(
      interacts,
      'getEIP20CoGateway',
      sinon.fake.returns(fakeEIP20CoGateway),
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
      messageRepository.getMessagesForConfirmation,
      1,
      [[gatewayAddress, blockNumber, MessageDirection.OriginToAuxiliary]],
    );

    SpyAssert.assert(
      proofGeneratorStub,
      1,
      [[gatewayRecord.gatewayAddress, [], blockNumber.toString(10)]],
    );

    SpyAssert.assert(
      fakeEIP20CoGateway.methods.proveGateway,
      1,
      [[
        blockNumber.toString(10),
        proof.encodedAccountValue,
        proof.serializedAccountProof]],
    );

    SpyAssert.assert(
      sendTransactionStub,
      1,
      [[
        fakeRawTransaction,
        { from: auxiliaryWorkerAddress, gasPrice: AUXILIARY_GAS_PRICE },
        auxiliaryWeb3,
      ]],
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
      'Gateway record does not exist for given gateway',
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

    const fakeEIP20CoGateway = {
      methods: {
        proveGateway: sinon.fake.returns(fakeRawTransaction),
      },
    };

    sinon.replace(
      interacts,
      'getEIP20CoGateway',
      sinon.fake.returns(fakeEIP20CoGateway),
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
      messageRepository.getMessagesForConfirmation,
      1,
      [[gatewayAddress, blockNumber, MessageDirection.OriginToAuxiliary]],
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
      fakeEIP20CoGateway.methods.proveGateway,
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
