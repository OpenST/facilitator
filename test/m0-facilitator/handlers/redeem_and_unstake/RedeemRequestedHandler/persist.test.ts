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

import RedeemRequestedHandler from '../../../../../src/m0-facilitator/handlers/redeem_and_unstake/RedeemRequestedHandler';
import MessageTransferRequest from '../../../../../src/m0-facilitator/models/MessageTransferRequest';
import MessageTransferRequestRepository, { RequestType } from '../../../../../src/m0-facilitator/repositories/MessageTransferRequestRepository';
import assert from '../../../../test_utils/assert';
import SpyAssert from '../../../../test_utils/SpyAssert';
import Repositories from '../../../../../src/m0-facilitator/repositories/Repositories';
import {
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../../../../../src/m0-facilitator/repositories/MessageRepository';
import Message from '../../../../../src/m0-facilitator/models/Message';
import Util from '../../../repositories/MessageTransferRequestRepository/util';

describe('RedeemRequestedHandler.persist()', (): void => {
  it('should persist successfully when redeemRequesteds is received first time for'
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

    const models = await handler.persist(transactions);

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

    assert.equal(
      models.length,
      transactions.length,
      'Number of models must be equal to transactions',
    );
    assert.deepStrictEqual(models[0], redeemRequest);
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

    const redeemRequestWithNullMessageHash = new MessageTransferRequest(
      transactions2[0].redeemRequestHash,
      RequestType.Redeem,
      new BigNumber(transactions2[0].blockNumber),
      new BigNumber(transactions2[0].amount),
      Web3Utils.toChecksumAddress(transactions2[0].beneficiary),
      new BigNumber(transactions2[0].gasPrice),
      new BigNumber(transactions2[0].gasLimit),
      new BigNumber(transactions2[0].nonce),
      Web3Utils.toChecksumAddress(transactions2[0].cogateway),
      Web3Utils.toChecksumAddress(transactions2[0].redeemer),
      Web3Utils.toChecksumAddress(transactions2[0].redeemerProxy),
      null, // Message hash should be null.
    );

    const models2 = await handler.persist(transactions2);

    assert.equal(
      models2.length,
      transactions2.length,
      'Number of models must be equal to transactions',
    );

    Util.checkInputAgainstOutput(redeemRequest, models1);
    Util.checkInputAgainstOutput(redeemRequestWithNullMessageHash, models2[0]);

    sinon.restore();
  });
});
