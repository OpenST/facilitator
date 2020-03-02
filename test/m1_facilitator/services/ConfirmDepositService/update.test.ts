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

import {ProofGenerator} from '@openst/mosaic-proof';
import Repositories
  from '../../../../src/m1_facilitator/repositories/Repositories';
import ConfirmDepositService
  from '../../../../src/m1_facilitator/services/ConfirmDepositService';
import Gateway, { GatewayType } from '../../../../src/m1_facilitator/models/Gateway';
import Message, {
  MessageStatus,
  MessageType,
} from '../../../../src/m1_facilitator/models/Message';
import DepositIntent
  from '../../../../src/m1_facilitator/models/DepositIntent';
import SpyAssert from '../../../test_utils/SpyAssert';
import TransactionExecutor
  from '../../../../src/m1_facilitator/lib/TransactionExecutor';

describe('ConfirmDepositService:update ', () => {
  let confirmDepositService: ConfirmDepositService;
  let gateway: Gateway;
  let message: Message;
  let depositIntent: DepositIntent;
  const confirmDepositRawTx = 'Some raw tx';
  const serializedProof = 'Storage proof';
  let transactionExecutor: any;
  let fakeERC20Cogateway: any;
  let getERC20CogatewaySpy: any;
  let auxiliaryWeb3: any;
  let confirmDepositSpy: any;

  beforeEach(async () => {
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

    depositIntent = new DepositIntent(
      message.messageHash,
      '0x0000000000000000000000000000000000000009',
      new BigNumber(10),
      '0x0000000000000000000000000000000000000010',
      web3Utils.sha3('2'),
    );

    await repositories.depositIntentRepository.save(depositIntent);
    await repositories.messageRepository.save(message);

    const originWeb3 = sinon.createStubInstance(Web3);
    auxiliaryWeb3 = sinon.createStubInstance(Web3);

    transactionExecutor = sinon.createStubInstance(TransactionExecutor);

    fakeERC20Cogateway = {
      methods: {
        confirmDeposit: () => {
        },
      },
    };

    confirmDepositSpy = sinon.replace(
      fakeERC20Cogateway.methods,
      'confirmDeposit',
      sinon.fake.returns(confirmDepositRawTx),
    );

    getERC20CogatewaySpy = sinon.replace(
      Mosaic.interacts,
      'getERC20Cogateway',
      sinon.fake.returns(fakeERC20Cogateway),
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
      'getOutboxProof',
      sinon.fake.returns(proof),
    );

    confirmDepositService = new ConfirmDepositService(
      originWeb3,
      auxiliaryWeb3,
      repositories.messageRepository,
      repositories.depositIntentRepository,
      transactionExecutor,
    );
  });

  it('should make confirm deposit transaction', async (): Promise<void> => {
    await confirmDepositService.update([gateway]);
    SpyAssert.assert(
      transactionExecutor.add,
      1,
      [[confirmDepositRawTx]],
    );

    SpyAssert.assertCall(getERC20CogatewaySpy, 1);

    SpyAssert.assert(confirmDepositSpy, 1, [
      [
        depositIntent.tokenAddress,
        (depositIntent.amount as BigNumber).toString(10),
        depositIntent.beneficiary,
        (message.feeGasPrice as BigNumber).toString(10),
        (message.feeGasLimit as BigNumber).toString(10),
        message.sender as string,
        gateway.remoteGatewayLastProvenBlockNumber.toString(10),
        serializedProof,
      ],
    ]);
  });
});
