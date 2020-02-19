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

import StakeRequestedHandler from '../../../../../src/m0_facilitator/handlers/stake_and_mint/StakeRequestedHandler';
import MessageTransferRequest from '../../../../../src/m0_facilitator/models/MessageTransferRequest';
import MessageTransferRequestRepository, { RequestType } from '../../../../../src/m0_facilitator/repositories/MessageTransferRequestRepository';
import assert from '../../../../test_utils/assert';
import SpyAssert from '../../../../test_utils/SpyAssert';
import Repositories from '../../../../../src/m0_facilitator/repositories/Repositories';
import Message from '../../../../../src/m0_facilitator/models/Message';
import {
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../../../../../src/m0_facilitator/repositories/MessageRepository';
import Util from '../../../repositories/MessageTransferRequestRepository/util';

describe('StakeRequestedHandler.persist()', (): void => {
  it('should persist successfully when stakeRequesteds is received first time for'
    + ' requestHash', async (): Promise<void> => {
    const gatewayAddress = '0x0000000000000000000000000000000000000002';
    const transactions = [{
      id: '1',
      stakeRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      gateway: gatewayAddress,
      staker: '0x0000000000000000000000000000000000000003',
      stakerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '10',
    }];

    const saveStub = sinon.stub();
    const sinonMock = sinon.createStubInstance(MessageTransferRequestRepository, {
      save: saveStub as any,
    });
    const handler = new StakeRequestedHandler(
      sinonMock as any,
      gatewayAddress,
    );

    const models = await handler.persist(transactions);

    const stakeRequest = new MessageTransferRequest(
      transactions[0].stakeRequestHash,
      RequestType.Stake,
      new BigNumber(transactions[0].amount),
      new BigNumber(transactions[0].blockNumber),
      Web3Utils.toChecksumAddress(transactions[0].beneficiary),
      new BigNumber(transactions[0].gasPrice),
      new BigNumber(transactions[0].gasLimit),
      new BigNumber(transactions[0].nonce),
      Web3Utils.toChecksumAddress(transactions[0].gateway),
      Web3Utils.toChecksumAddress(transactions[0].staker),
      Web3Utils.toChecksumAddress(transactions[0].stakerProxy),
      null,
    );

    assert.equal(
      models.length,
      transactions.length,
      'Number of models must be equal to transactions',
    );
    assert.deepStrictEqual(models[0], stakeRequest);
    SpyAssert.assert(saveStub, 1, [[stakeRequest]]);
    sinon.restore();
  });

  it('should update messageHash(null) and blockNumber when stakeRequest '
    + 'is already present', async (): Promise<void> => {
    const gatewayAddress = '0x0000000000000000000000000000000000000002';

    const config = {
      repos: await Repositories.create(),
    };
    const messageHash = 'messageHash';
    const transactions1 = [{
      id: '1',
      stakeRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      gateway: gatewayAddress,
      staker: '0x0000000000000000000000000000000000000003',
      stakerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '10',
    }];
    const message = new Message(
      messageHash,
      MessageType.Stake,
      MessageDirection.OriginToAuxiliary,
      gatewayAddress,
      MessageStatus.Undeclared,
      MessageStatus.Undeclared,
      new BigNumber(transactions1[0].gasPrice),
      new BigNumber(transactions1[0].gasLimit),
      new BigNumber(transactions1[0].nonce),
      transactions1[0].stakerProxy,
      new BigNumber(transactions1[0].blockNumber),
      'secret',
      'hashlock',
    );
    await config.repos.messageRepository.save(
      message,
    );
    const stakeRequest = new MessageTransferRequest(
      transactions1[0].stakeRequestHash,
      RequestType.Stake,
      new BigNumber(transactions1[0].blockNumber),
      new BigNumber(transactions1[0].amount),
      Web3Utils.toChecksumAddress(transactions1[0].beneficiary),
      new BigNumber(transactions1[0].gasPrice),
      new BigNumber(transactions1[0].gasLimit),
      new BigNumber(transactions1[0].nonce),
      Web3Utils.toChecksumAddress(transactions1[0].gateway),
      Web3Utils.toChecksumAddress(transactions1[0].staker),
      Web3Utils.toChecksumAddress(transactions1[0].stakerProxy),
      messageHash,
    );
    const models1 = await config.repos.messageTransferRequestRepository.save(
      stakeRequest,
    );
    const handler = new StakeRequestedHandler(config.repos.messageTransferRequestRepository, gatewayAddress);
    // Transaction with higher block number.
    const transactions2 = [{
      id: '1',
      stakeRequestHash: Web3Utils.sha3('1'),
      amount: '10',
      beneficiary: '0x0000000000000000000000000000000000000001',
      gasPrice: '1',
      gasLimit: '1',
      nonce: '1',
      gateway: gatewayAddress,
      staker: '0x0000000000000000000000000000000000000003',
      stakerProxy: '0x0000000000000000000000000000000000000004',
      blockNumber: '11',
    }];

    const stakeRequestWithNullMessageHash = new MessageTransferRequest(
      transactions2[0].stakeRequestHash,
      RequestType.Stake,
      new BigNumber(transactions2[0].blockNumber),
      new BigNumber(transactions2[0].amount),
      Web3Utils.toChecksumAddress(transactions2[0].beneficiary),
      new BigNumber(transactions2[0].gasPrice),
      new BigNumber(transactions2[0].gasLimit),
      new BigNumber(transactions2[0].nonce),
      Web3Utils.toChecksumAddress(transactions2[0].gateway),
      Web3Utils.toChecksumAddress(transactions2[0].staker),
      Web3Utils.toChecksumAddress(transactions2[0].stakerProxy),
      null, // Message hash should be null.
    );

    const models2 = await handler.persist(transactions2);

    assert.equal(
      models2.length,
      transactions2.length,
      'Number of models must be equal to transactions',
    );

    Util.checkInputAgainstOutput(stakeRequest, models1);
    Util.checkInputAgainstOutput(stakeRequestWithNullMessageHash, models2[0]);

    sinon.restore();
  });
});
