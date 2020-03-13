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

import sinon from 'sinon';
import Web3 from 'web3';
import * as web3Utils from 'web3-utils';
import BigNumber from 'bignumber.js';
import Mosaic from 'Mosaic';

import ProofGenerator from '../../../../src/ProofGenerator';
import Repositories
  from '../../../../src/m1_facilitator/repositories/Repositories';
import Gateway, { GatewayType } from '../../../../src/m1_facilitator/models/Gateway';
import Message, {
  MessageStatus,
  MessageType,
} from '../../../../src/m1_facilitator/models/Message';
import SpyAssert from '../../../test_utils/SpyAssert';
import TransactionExecutor
  from '../../../../src/m1_facilitator/lib/TransactionExecutor';
import ConfirmWithdrawService
  from '../../../../src/m1_facilitator/services/ConfirmWithdrawService';
import WithdrawIntent
  from '../../../../src/m1_facilitator/models/WithdrawIntent';
import ERC20GatewayTokenPair
  from '../../../../src/m1_facilitator/models/ERC20GatewayTokenPair';

describe('ConfirmWithdraw:update ', (): void => {
  let confirmWithdrawService: ConfirmWithdrawService;
  let gateway: Gateway;
  let message: Message;
  let withdrawIntent: WithdrawIntent;
  const confirmWithdrawRawTx = 'Some raw tx';
  const serializedProof = 'Storage proof';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let transactionExecutor: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fakeERC20Gateway: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let getERC20GatewaySpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let auxiliaryWeb3: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let confirmWithdrawSpy: any;
  const utilityToken = '0x0000000000000000000000000000000000000009';

  beforeEach(async (): Promise<void> => {
    const repositories = await Repositories.create();

    gateway = new Gateway(
      Gateway.getGlobalAddress('0x0000000000000000000000000000000000000002'),
      Gateway.getGlobalAddress('0x0000000000000000000000000000000000000001'),
      GatewayType.ERC20,
      '0x0000000000000000000000000000000000000003',
      new BigNumber(200),
      '0x0000000000000000000000000000000000000003',
    );

    message = new Message(
      web3Utils.sha3('1'),
      MessageType.Withdraw,
      MessageStatus.Declared,
      MessageStatus.Undeclared,
      gateway.remoteGA,
      new BigNumber('1'),
      new BigNumber('1'),
      new BigNumber('100'),
      'intenthash',
      '0x0000000000000000000000000000000000000008',
    );

    withdrawIntent = new WithdrawIntent(
      message.messageHash,
      '0x0000000000000000000000000000000000000009',
      new BigNumber(10),
      '0x0000000000000000000000000000000000000010',
      web3Utils.sha3('2'),
    );

    const gatwayTokenPair = new ERC20GatewayTokenPair(
      gateway.gatewayGA,
      withdrawIntent.tokenAddress as string,
      utilityToken,
    );

    await repositories.withdrawIntentRepository.save(withdrawIntent);
    await repositories.messageRepository.save(message);
    await repositories.erc20GatewayTokenPairRepository.save(gatwayTokenPair);

    const originWeb3 = sinon.createStubInstance(Web3);
    auxiliaryWeb3 = sinon.createStubInstance(Web3);

    transactionExecutor = sinon.createStubInstance(TransactionExecutor);

    fakeERC20Gateway = {
      methods: {
        confirmWithdraw: () => {
        },
        outboxStorageIndex: () => ({
          call: () => '7',
        }),
      },
    };

    confirmWithdrawSpy = sinon.replace(
      fakeERC20Gateway.methods,
      'confirmWithdraw',
      sinon.fake.returns(confirmWithdrawRawTx),
    );

    getERC20GatewaySpy = sinon.replace(
      Mosaic.interacts,
      'getERC20Gateway',
      sinon.fake.returns(fakeERC20Gateway),
    );

    const proof = {
      storageProof: [
        {
          value: '0x01',
          serializedProof,
        },
      ],
    };

    sinon.replace(
      ProofGenerator.prototype,
      'generate',
      sinon.fake.returns(proof),
    );

    confirmWithdrawService = new ConfirmWithdrawService(
      originWeb3,
      auxiliaryWeb3,
      repositories.messageRepository,
      repositories.withdrawIntentRepository,
      repositories.erc20GatewayTokenPairRepository,
      transactionExecutor,
    );
  });

  it('should make confirm withdraw transaction', async (): Promise<void> => {
    await confirmWithdrawService.update([gateway]);
    SpyAssert.assert(
      transactionExecutor.add,
      1,
      [[gateway.gatewayGA, confirmWithdrawRawTx]],
    );

    SpyAssert.assertCall(getERC20GatewaySpy, 1);

    SpyAssert.assert(confirmWithdrawSpy, 1, [
      [
        withdrawIntent.tokenAddress,
        utilityToken,
        (withdrawIntent.amount as BigNumber).toString(10),
        withdrawIntent.beneficiary,
        (message.feeGasPrice as BigNumber).toString(10),
        (message.feeGasLimit as BigNumber).toString(10),
        message.sender as string,
        gateway.remoteGatewayLastProvenBlockNumber.toString(10),
        serializedProof,
      ],
    ]);
  });

  after((): void => {
    sinon.restore();
  });
});
