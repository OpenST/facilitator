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
import ProveCoGatewayService from '../../../../../src/m0-facilitator/services/redeem_and_unstake/ProveCoGatewayService';
import SpyAssert from '../../../test_utils/SpyAssert';
import StubData from '../../../test_utils/StubData';
import GatewayRepository from '../../../../../src/m0-facilitator/repositories/GatewayRepository';
import { MessageDirection, MessageRepository } from '../../../../../src/m0-facilitator/repositories/MessageRepository';
import Gateway from '../../../../../src/m0-facilitator/models/Gateway';
import Utils from '../../../../../src/m0-facilitator/Utils';
import { ORIGIN_GAS_PRICE } from '../../../../../src/m0-facilitator/Constants';

describe('ProveCoGatewayService.update()', (): void => {
  const originWeb3 = new Web3(null);
  const auxiliaryWeb3 = new Web3(null);
  const originWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const coGatewayAddress = '0x0000000000000000000000000000000000000001';
  const fakeTransactionHash = 'fakeHash';
  const originBlockHeight = new BigNumber(100);
  const auxiliaryBlockHeight = new BigNumber(200);
  const auxiliaryChainId = 123;
  let proveCoGatewayService: ProveCoGatewayService;

  beforeEach((): void => {
    proveCoGatewayService = new ProveCoGatewayService(
      sinon.fake() as any,
      sinon.fake() as any,
      originWeb3,
      auxiliaryWeb3,
      originWorkerAddress,
      coGatewayAddress,
      auxiliaryChainId,
    );
  });

  it('should react to update on auxiliary chain model ', async (): Promise<void> => {
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      auxiliaryChainId,
      originBlockHeight,
      auxiliaryBlockHeight,
    );

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

    const proveCoGatewayServiceInstance = new ProveCoGatewayService(
      gatewayRepository as any,
      messageRepository as any,
      originWeb3,
      auxiliaryWeb3,
      originWorkerAddress,
      coGatewayAddress,
      auxiliaryChainId,
    );

    await proveCoGatewayServiceInstance.update([auxiliaryChain]);

    SpyAssert.assert(
      gatewayRepository.get,
      1,
      [[coGatewayAddress]],
    );

    SpyAssert.assert(
      messageRepository.getMessagesForConfirmation,
      1,
      [[coGatewayAddress, auxiliaryBlockHeight, MessageDirection.AuxiliaryToOrigin]],
    );

    SpyAssert.assert(
      proofGeneratorStub,
      1,
      [[gatewayRecord.gatewayAddress, [], auxiliaryBlockHeight.toString(10)]],
    );

    SpyAssert.assert(
      fakeEIP20Gateway.methods.proveGateway,
      1,
      [[
        auxiliaryBlockHeight.toString(10),
        proof.encodedAccountValue,
        proof.serializedAccountProof]],
    );

    SpyAssert.assert(
      sendTransactionStub,
      1,
      [[fakeRawTransaction, { from: originWorkerAddress, gasPrice: ORIGIN_GAS_PRICE }, originWeb3]],
    );

    sinon.restore();
  });

  it('should not try to proveGateway if there are no pending messages', async (): Promise<void> => {
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      auxiliaryChainId,
      originBlockHeight,
      auxiliaryBlockHeight,
    );

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

    const proveGatewayServiceInstance = new ProveCoGatewayService(
      gateawayRepository as any,
      messageRepository as any,
      originWeb3,
      auxiliaryWeb3,
      originWorkerAddress,
      coGatewayAddress,
      auxiliaryChainId,
    );

    await proveGatewayServiceInstance.update([auxiliaryChain]);

    SpyAssert.assert(
      gateawayRepository.get,
      1,
      [[coGatewayAddress]],
    );

    SpyAssert.assert(
      messageRepository.getMessagesForConfirmation,
      1,
      [[coGatewayAddress, auxiliaryBlockHeight, MessageDirection.AuxiliaryToOrigin]],
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

  it('should only react to interested chainID', async (): Promise<void> => {
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      1,
      new BigNumber(100),
      new BigNumber(200),
    );

    const proveGatewayStub = sinon.stub(proveCoGatewayService, 'proveCoGateway' as any);
    await proveCoGatewayService.update([auxiliaryChain]);

    SpyAssert.assert(proveGatewayStub, 0, [[auxiliaryChain.lastAuxiliaryBlockHeight]]);
    sinon.restore();
  });


  it('should skip for null last origin block height', async (): Promise<void> => {
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      auxiliaryChainId,
      new BigNumber(100),
      undefined,
    );

    const proveGatewayStub = sinon.stub(proveCoGatewayService, 'proveCoGateway' as any);
    await proveCoGatewayService.update([auxiliaryChain]);

    SpyAssert.assert(proveGatewayStub, 0, [auxiliaryChain.lastAuxiliaryBlockHeight]);
  });
});
