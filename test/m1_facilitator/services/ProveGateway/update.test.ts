// Copyright 2020 OpenST Ltd.
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

import Web3 from 'web3';
import sinon, { SinonStubbedInstance } from 'sinon';

import { ProofGenerator } from '@openst/mosaic-proof';
import Mosaic from 'Mosaic';
import BigNumber from 'bignumber.js';
import * as web3Utils from 'web3-utils';

import Repositories
  from '../../../../src/m1_facilitator/repositories/Repositories';
import ProveGatewayService
  from '../../../../src/m1_facilitator/services/ProveGatewayService';
import TransactionExecutor
  from '../../../../src/m1_facilitator/lib/TransactionExecutor';
import Anchor from '../../../../src/m1_facilitator/models/Anchor';
import Gateway, { GatewayType } from '../../../../src/m1_facilitator/models/Gateway';
import Message, {
  MessageStatus,
  MessageType,
} from '../../../../src/m1_facilitator/models/Message';
import SpyAssert from '../../../test_utils/SpyAssert';

describe('ProveGateway::update', (): void => {
  let originTransactionExecutor: SinonStubbedInstance<TransactionExecutor>;
  let auxiliaryTransactionExecutor: SinonStubbedInstance<TransactionExecutor>;
  let proveGatewayService: ProveGatewayService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let outboxProofSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let getERC20CogatewaySpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let proveGatewaySpy: any;
  const proveGatewayRawTx = 'rawTx';
  const anchorAddress = '0x0000000000000000000000000000000000000007';
  const gatewayAddress = '0x0000000000000000000000000000000000000002';
  const proof = {
    encodedAccountValue: 'encodedAccountValue',
    serializedAccountProof: 'serializedAccountProof',
  };
  let gateway: Gateway;

  beforeEach(async (): Promise<void> => {
    const repositories = await Repositories.create();

    gateway = new Gateway(
      Gateway.getGlobalAddress(gatewayAddress),
      Gateway.getGlobalAddress('0x0000000000000000000000000000000000000001'),
      GatewayType.ERC20,
      Anchor.getGlobalAddress(anchorAddress),
      new BigNumber(200),
      '0x0000000000000000000000000000000000000003',
    );
    await repositories.gatewayRepository.save(
      gateway,
    );

    const depositMessage = new Message(
      web3Utils.sha3('1'),
      MessageType.Deposit,
      MessageStatus.Declared,
      MessageStatus.Undeclared,
      gateway.gatewayGA,
      new BigNumber('1'),
      new BigNumber('1'),
      new BigNumber('100'),
      'intenthash',
      '0x0000000000000000000000000000000000000008',
    );
    await repositories.messageRepository.save(depositMessage);

    const originWeb3 = sinon.createStubInstance(Web3);

    const auxiliaryWeb3 = sinon.createStubInstance(Web3);
    originTransactionExecutor = sinon.createStubInstance(TransactionExecutor);
    auxiliaryTransactionExecutor = sinon.createStubInstance(TransactionExecutor);

    outboxProofSpy = sinon.replace(
      ProofGenerator.prototype,
      'getOutboxProof',
      sinon.fake.resolves(proof),
    );

    const fakeERC20Cogateway = {
      methods: {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        proveGateway: () => {
        },
      },
    };
    getERC20CogatewaySpy = sinon.replace(
      Mosaic.interacts,
      'getERC20Cogateway',
      sinon.fake.returns(fakeERC20Cogateway),
    );

    proveGatewaySpy = sinon.replace(
      fakeERC20Cogateway.methods,
      'proveGateway',
      sinon.fake.returns(proveGatewayRawTx),
    );

    proveGatewayService = new ProveGatewayService(
      repositories.gatewayRepository,
      repositories.messageRepository,
      originWeb3,
      auxiliaryWeb3,
      originTransactionExecutor as any,
      auxiliaryTransactionExecutor as any,
    );
  });


  it('should perform prove gateway transaction', async (): Promise<void> => {
    const anchor = new Anchor(
      Anchor.getGlobalAddress(anchorAddress),
      new BigNumber('250'),
    );

    await proveGatewayService.update([anchor]);

    SpyAssert.assert(auxiliaryTransactionExecutor.add, 1, [[
      gateway.remoteGA, proveGatewayRawTx,
    ]]);

    SpyAssert.assert(proveGatewaySpy, 1, [[
      anchor.lastAnchoredBlockNumber.toString(10),
      proof.encodedAccountValue,
      proof.serializedAccountProof,
    ]]);

    SpyAssert.assertCall(getERC20CogatewaySpy, 1);
    SpyAssert.assert(outboxProofSpy, 1, [[
      gatewayAddress,
      [],
      anchor.lastAnchoredBlockNumber.toString(10),
    ]]);
  });

  after((): void => {
    sinon.restore();
  });
});
