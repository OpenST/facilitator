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

import * as web3Utils from 'web3-utils';

import BigNumber from 'bignumber.js';
import Repositories
  from '../../../../src/m1_facilitator/repositories/Repositories';
import DeclaredWithdrawIntentsHandler
  from '../../../../src/m1_facilitator/handlers/DeclaredWithdrawIntentsHandler';
import MessageRepository
  from '../../../../src/m1_facilitator/repositories/MessageRepository';
import WithdrawIntentRepository
  from '../../../../src/m1_facilitator/repositories/WithdrawIntentRepository';
import assert from '../../../test_utils/assert';
import Message, {
  MessageStatus,
  MessageType,
} from '../../../../src/m1_facilitator/models/Message';
import GatewayRepository
  from '../../../../src/m1_facilitator/repositories/GatewayRepository';
import Gateway, { GatewayType } from '../../../../src/m1_facilitator/models/Gateway';
import Anchor from '../../../../src/m1_facilitator/models/Anchor';
import ERC20GatewayTokenPair from '../../../../src/m1_facilitator/models/ERC20GatewayTokenPair';
import ERC20GatewayTokenPairRepository from '../../../../src/m1_facilitator/repositories/ERC20GatewayTokenPairRepository';
import Utils from '../../../../src/common/Utils';

describe('DeclaredWithdrawIntentsHandler::handle', (): void => {
  let handler: DeclaredWithdrawIntentsHandler;
  let messageRepository: MessageRepository;
  let withdrawIntentRepository: WithdrawIntentRepository;
  let gatewayRepository: GatewayRepository;
  let erc20GatewayTokenPairRepository: ERC20GatewayTokenPairRepository;
  let repositories: Repositories;

  const withdrawIntentEntityRecords = [
    {
      messageHash: web3Utils.sha3('1'),
      contractAddress: '0x0000000000000000000000000000000000000001',
      utilityToken: '0x0000000000000000000000000000000000000002',
      amount: '2',
      beneficiary: '0x0000000000000000000000000000000000000003',
      feeGasPrice: '2',
      feeGasLimit: '2',
      withdrawer: '0x0000000000000000000000000000000000000005',
      blockNumber: '100',
    },
    {
      messageHash: web3Utils.sha3('2'),
      contractAddress: '0x0000000000000000000000000000000000000001',
      utilityToken: '0x0000000000000000000000000000000000000002',
      amount: '3',
      beneficiary: '0x0000000000000000000000000000000000000004',
      feeGasPrice: '2',
      feeGasLimit: '2',
      withdrawer: '0x0000000000000000000000000000000000000005',
      blockNumber: '101',
    },
  ];

  beforeEach(async (): Promise<void> => {
    repositories = await Repositories.create();
    ({
      messageRepository, withdrawIntentRepository, gatewayRepository, erc20GatewayTokenPairRepository,
    } = repositories);
    handler = new DeclaredWithdrawIntentsHandler(
      repositories.withdrawIntentRepository,
      repositories.messageRepository,
      repositories.gatewayRepository,
      repositories.erc20GatewayTokenPairRepository,
      new Set(),
    );

    const gateway = new Gateway(
      Gateway.getGlobalAddress(withdrawIntentEntityRecords[0].contractAddress),
      Gateway.getGlobalAddress('0x0000000000000000000000000000000000000005'),
      GatewayType.ERC20,
      Anchor.getGlobalAddress('0x0000000000000000000000000000000000000007'),
      new BigNumber(0),
      '0x0000000000000000000000000000000000000008',
    );

    await gatewayRepository.save(gateway);
  });

  async function assertWithdrawIntent(withdrawIntentEntityRecord: {
    messageHash: string;
    contractAddress: string;
    utilityToken: string;
    amount: string;
    beneficiary: string;
    feeGasPrice: string;
    feeGasLimit: string;
    withdrawer: string;
    blockNumber: string;
  }): Promise<void> {
    const messageRecord = await messageRepository.get(
      withdrawIntentEntityRecord.messageHash,
    );
    const withdrawIntentRecord = await withdrawIntentRepository.get(
      withdrawIntentEntityRecord.messageHash,
    );

    assert.strictEqual(
      messageRecord && messageRecord.messageHash,
      withdrawIntentEntityRecord.messageHash,
      'Message hash mus match',
    );

    assert.strictEqual(
      messageRecord && messageRecord.sourceStatus,
      MessageStatus.Declared,
      'Message source status must be declared',
    );

    assert.strictEqual(
      messageRecord && messageRecord.targetStatus,
      MessageStatus.Undeclared,
      'Message target status must be declared',
    );

    assert.strictEqual(
      messageRecord && messageRecord.type,
      MessageType.Withdraw,
      'Message type must be withdraw',
    );

    assert.strictEqual(
      messageRecord && messageRecord.gatewayAddress,
      withdrawIntentEntityRecord.contractAddress,
      'Gateway address must match',
    );

    assert.strictEqual(
      messageRecord && messageRecord.sender,
      withdrawIntentEntityRecord.withdrawer,
      'Withdrawer address must match',
    );

    assert.isOk(
      messageRecord
      && messageRecord.feeGasPrice
      && messageRecord.feeGasPrice.isEqualTo(
        new BigNumber(withdrawIntentEntityRecord.feeGasPrice),
      ),
      `Expected FeeGas Price is ${withdrawIntentEntityRecord.feeGasPrice} must match `
      + ` but found ${messageRecord && messageRecord.feeGasPrice && messageRecord.feeGasPrice.toString(10)}`,
    );

    assert.isOk(
      messageRecord
      && messageRecord.feeGasLimit
      && messageRecord.feeGasLimit.isEqualTo(
        new BigNumber(withdrawIntentEntityRecord.feeGasLimit),
      ),
      `Expected FeeGas limit is ${withdrawIntentEntityRecord.feeGasLimit} must match `
      + ` but found ${messageRecord && messageRecord.feeGasLimit && messageRecord.feeGasLimit.toString(10)}`,
    );

    assert.isOk(
      messageRecord
      && messageRecord.sourceDeclarationBlockNumber
      && messageRecord.sourceDeclarationBlockNumber.isEqualTo(
        new BigNumber(withdrawIntentEntityRecord.blockNumber),
      ),
      `Expected source declaration block height is ${withdrawIntentEntityRecord.blockNumber} must match `
      + ` but found ${messageRecord && messageRecord.sourceDeclarationBlockNumber && messageRecord.sourceDeclarationBlockNumber.toString(10)}`,
    );

    assert.strictEqual(
      withdrawIntentRecord && withdrawIntentRecord.messageHash,
      withdrawIntentEntityRecord.messageHash,
      'Message hash must match',
    );

    assert.strictEqual(
      withdrawIntentRecord && withdrawIntentRecord.beneficiary,
      withdrawIntentEntityRecord.beneficiary,
      'Beneficiary must match',
    );

    assert.strictEqual(
      withdrawIntentRecord && withdrawIntentRecord.tokenAddress,
      withdrawIntentEntityRecord.utilityToken,
      'Token address must match',
    );

    assert.isOk(
      withdrawIntentRecord
      && withdrawIntentRecord.amount
      && withdrawIntentRecord.amount.isEqualTo(
        new BigNumber(withdrawIntentEntityRecord.amount),
      ),
      `Expected withdrawal amount is ${withdrawIntentRecord && withdrawIntentRecord.amount}`
      + ` but got ${withdrawIntentEntityRecord && withdrawIntentEntityRecord.amount}`,
    );
  }

  it('should handle declared withdraw intent records', async (): Promise<void> => {
    await handler.handle(withdrawIntentEntityRecords);

    await assertWithdrawIntent(withdrawIntentEntityRecords[0]);
    await assertWithdrawIntent(withdrawIntentEntityRecords[1]);
  });

  it('should update source status to declared if message already exists', async (): Promise<void> => {
    const existingMessage = new Message(
      web3Utils.sha3('1'),
      MessageType.Withdraw,
      MessageStatus.Undeclared,
      MessageStatus.Declared,
      '0x0000000000000000000000000000000000000001',
    );

    await messageRepository.save(existingMessage);

    await handler.handle(withdrawIntentEntityRecords);

    const messageRecord = await messageRepository.get(
      withdrawIntentEntityRecords[0].messageHash,
    );

    assert.strictEqual(
      messageRecord && messageRecord.sourceStatus,
      MessageStatus.Declared,
      'Message source status must be declared',
    );
  });

  it('should filter records which should not be facilitated', async (): Promise<void> => {
    const record = [
      {
        messageHash: web3Utils.sha3('1'),
        contractAddress: '0x0000000000000000000000000000000000000001', // Cogateway address
        utilityToken: '0x0000000000000000000000000000000000000002',
        amount: '2',
        beneficiary: '0x0000000000000000000000000000000000000003',
        feeGasPrice: '2',
        feeGasLimit: '2',
        withdrawer: '0x0000000000000000000000000000000000000005',
        blockNumber: '100',
      },
    ];
    const supportedTokens = new Set(['0x0000000000000000000000000000000000000022']);
    const valueTokenAddress = '0x0000000000000000000000000000000000000012';
    const gatewayAddress = '0x0000000000000000000000000000000000000011';
    const erc20GatewayTokenPairModel = new ERC20GatewayTokenPair(
      Utils.toChecksumAddress(gatewayAddress),
      Utils.toChecksumAddress(valueTokenAddress),
      Utils.toChecksumAddress(record[0].utilityToken),
    );
    await erc20GatewayTokenPairRepository.save(
      erc20GatewayTokenPairModel,
    );

    const gateway = new Gateway(
      Gateway.getGlobalAddress(record[0].contractAddress),
      gatewayAddress,
      GatewayType.ERC20,
      '0x0000000000000000000000000000000000000099',
      new BigNumber(100),
    );
    await gatewayRepository.save(
      gateway,
    );

    handler = new DeclaredWithdrawIntentsHandler(
      repositories.withdrawIntentRepository,
      repositories.messageRepository,
      repositories.gatewayRepository,
      repositories.erc20GatewayTokenPairRepository,
      supportedTokens,
    );
    await handler.handle(record);

    const message = await messageRepository.get(
      record[0].messageHash,
    );

    assert.strictEqual(
      message,
      null,
      'Message should not be saved.',
    );

    const withdrawIntent = await withdrawIntentRepository.get(
      record[0].messageHash,
    );
    assert.strictEqual(
      withdrawIntent,
      null,
      'Withdraw intent record should not be saved.',
    );
  });
});
