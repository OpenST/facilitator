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
import * as Web3Utils from 'web3-utils';

import RedeemRequestedHandler from '../../../../../src/m0_facilitator/handlers/redeem_and_unstake/RedeemRequestedHandler';
import MessageTransferRequest from '../../../../../src/m0_facilitator/models/MessageTransferRequest';
import MessageTransferRequestRepository, { RequestType } from '../../../../../src/m0_facilitator/repositories/MessageTransferRequestRepository';
import SpyAssert from '../../../../test_utils/SpyAssert';
import Repositories from '../../../../../src/m0_facilitator/repositories/Repositories';
import {
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../../../../../src/m0_facilitator/repositories/MessageRepository';
import Message from '../../../../../src/m0_facilitator/models/Message';
import Util from '../../../repositories/MessageTransferRequestRepository/util';

describe('RedeemRequestedHandler.handle()', (): void => {
  it('should handle successfully when redeemRequesteds is received first time for'
    + ' redeemRequestHash', async (): Promise<void> => {
    const cogatewayAddress = '0x0000000000000000000000000000000000000002';
    const transactions = [{
      id: '1',
      redeemRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      cogateway: cogatewayAddress,
      redeemer: '0x0000000000000000000000000000000000000003',
      redeemerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '10',
    }];

    const saveStub = sinon.stub();
    const sinonMock = sinon.createStubInstance(MessageTransferRequestRepository, {
      save: Promise.resolve(saveStub as any),
    });
    const handler = new RedeemRequestedHandler(
      sinonMock as any,
      cogatewayAddress,
    );

    await handler.handle(transactions);

    const redeemRequest = new MessageTransferRequest(
      transactions[0].redeemRequestHash,
      RequestType.Redeem,
      new BigNumber(transactions[0].amount),
      new BigNumber(transactions[0].blockNumber),
      Web3Utils.toChecksumAddress(transactions[0].beneficiary),
      new BigNumber(transactions[0].gasPrice),
      new BigNumber(transactions[0].gasLimit),
      new BigNumber(transactions[0].nonce),
      Web3Utils.toChecksumAddress(transactions[0].cogateway),
      Web3Utils.toChecksumAddress(transactions[0].redeemer),
      Web3Utils.toChecksumAddress(transactions[0].redeemerProxy),
      null,
    );

    SpyAssert.assert(sinonMock.save, 1, [[redeemRequest]]);
    sinon.restore();
  });

  it('should update blockNumber and messageHash with blank when redeemRequest '
    + 'is already present', async (): Promise<void> => {
    const cogatewayAddress = '0x0000000000000000000000000000000000000002';
    const config = {
      repos: await Repositories.create(),
    };
    const messageHash = 'messageHash';
    const transactions1 = [{
      id: '1',
      redeemRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      cogateway: cogatewayAddress,
      redeemer: '0x0000000000000000000000000000000000000003',
      redeemerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '10',
    }];
    const message = new Message(
      messageHash,
      MessageType.Stake,
      MessageDirection.OriginToAuxiliary,
      cogatewayAddress,
      MessageStatus.Undeclared,
      MessageStatus.Undeclared,
      new BigNumber(transactions1[0].gasPrice),
      new BigNumber(transactions1[0].gasLimit),
      new BigNumber(transactions1[0].nonce),
      transactions1[0].redeemerProxy,
      new BigNumber(transactions1[0].blockNumber),
      'secret',
      'hashlock',
    );
    await config.repos.messageRepository.save(
      message,
    );

    const redeemRequest = new MessageTransferRequest(
      transactions1[0].redeemRequestHash,
      RequestType.Redeem,
      new BigNumber(transactions1[0].blockNumber),
      new BigNumber(transactions1[0].amount),
      Web3Utils.toChecksumAddress(transactions1[0].beneficiary),
      new BigNumber(transactions1[0].gasPrice),
      new BigNumber(transactions1[0].gasLimit),
      new BigNumber(transactions1[0].nonce),
      Web3Utils.toChecksumAddress(transactions1[0].cogateway),
      Web3Utils.toChecksumAddress(transactions1[0].redeemer),
      Web3Utils.toChecksumAddress(transactions1[0].redeemerProxy),
      messageHash,
    );
    const models1 = await config.repos.messageTransferRequestRepository.save(
      redeemRequest,
    );
    const handler = new RedeemRequestedHandler(
      config.repos.messageTransferRequestRepository,
      cogatewayAddress,
    );
    // Transaction with higher block number.
    const transactions2 = [{
      id: '1',
      redeemRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      cogateway: cogatewayAddress,
      redeemer: '0x0000000000000000000000000000000000000003',
      redeemerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '11',
    }];

    await handler.handle(transactions2);

    Util.checkInputAgainstOutput(redeemRequest, models1);

    sinon.restore();
  });
});
