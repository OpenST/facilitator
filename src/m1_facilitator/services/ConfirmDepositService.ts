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
import Mosaic from 'Mosaic';

import BigNumber from 'bignumber.js';
import { Error } from 'sequelize';
import { TransactionObject } from 'web3/eth/types';
import ProofGenerator from '../../ProofGenerator';
import MessageRepository from '../repositories/MessageRepository';
import DepositIntentRepository from '../repositories/DepositIntentRepository';
import Observer from '../../common/observer/Observer';
import DepositIntent from '../models/DepositIntent';
import Message, { MessageType } from '../models/Message';
import Gateway from '../models/Gateway';
import TransactionExecutor from '../lib/TransactionExecutor';
import Logger from '../../common/Logger';

import assert = require('assert');

/**
 * This service reacts to updates in ConfirmDeposit entity.
 */
export default class ConfirmDepositService extends Observer<Gateway> {
  /** Instance of origin Web3. */
  private originWeb3: Web3;

  /** Instance of auxiliary Web3. */
  private auxiliaryWeb3: Web3;

  /** Instance of message repository. */
  private messageRepository: MessageRepository;

  /** Instance of deposit intent repository. */
  private depositIntentRepository: DepositIntentRepository;

  /** Instance of auxiliary transaction executor. */
  private auxiliaryTransactionExecutor: TransactionExecutor;

  /**
   * Construct ConfirmDepositService with the params.
   *
   * @param originWeb3 Instance of origin web3.
   * @param auxiliaryWeb3 Instance of auxiliary web3.
   * @param messageRepository Instance of message Repository.
   * @param depositIntentRepository Instance of deposit intent repository.
   * @param auxiliaryTransactionExecutor Instance of auxiliary transaction executor.
   */
  public constructor(
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    messageRepository: MessageRepository,
    depositIntentRepository: DepositIntentRepository,
    auxiliaryTransactionExecutor: TransactionExecutor,
  ) {
    super();
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.messageRepository = messageRepository;
    this.depositIntentRepository = depositIntentRepository;
    this.auxiliaryTransactionExecutor = auxiliaryTransactionExecutor;
  }

  /**
   * Triggers on update in gateway model.This service checks for pending
   * messages based on below condition:
   *  1. Message Type should be Deposit
   *  2. Source declaration block height of message should be less than equals
   *     to remote gateway last proven block height.
   *  3. Target status of message should be undeclared.
   *  4. Message should be initiated from given gateway.
   *
   * If there are pending messages based on above criteria, confirm deposit
   * transaction is sent.
   *
   * @param gateways List of gateway object.
   */
  public async update(gateways: Gateway[]): Promise<void> {
    Logger.debug('Confirm deposit service triggered');
    const confirmMessagePromises = gateways.map(async (gateway): Promise<void> => {
      Logger.debug(`Searching pending messages for gateway: ${gateway.remoteGA} type:${MessageType.Deposit} and last prove block number ${gateway.remoteGatewayLastProvenBlockNumber.toString(10)}`);
      const messages = await this.messageRepository.getPendingMessagesByGateway(
        gateway.remoteGA,
        MessageType.Deposit,
        gateway.remoteGatewayLastProvenBlockNumber,
      );

      Logger.debug(`Total pending messages ${messages.length}`);

      if (messages.length > 0) {
        await this.confirmMessages(messages, gateway);
      }
    });

    await Promise.all(confirmMessagePromises);
  }

  /**
   * Creates and send confirm deposit transaction.
   *
   * @param messages List of messages which needs to be confirmed.
   * @param gateway Instance of gateway contract.
   */
  private async confirmMessages(messages: Message[], gateway: Gateway): Promise<void> {
    const confirmMessageTransactionPromises = messages.map(async (message): Promise<void> => {
      const depositIntent = await this.depositIntentRepository.get(message.messageHash);
      if (depositIntent !== null) {
        const rawTransaction = await this.confirmDepositIntentTransaction(
          message,
          depositIntent,
          gateway,
        );

        await this.auxiliaryTransactionExecutor.add(gateway.gatewayGA, rawTransaction);
      }
    });
    await Promise.all(confirmMessageTransactionPromises);
  }

  /**
   * Creates confirm deposit raw transaction.
   *
   * @param message Message Object.
   * @param depositIntent Deposit intent object.
   * @param gateway Gateway object.
   */
  private async confirmDepositIntentTransaction(
    message: Message,
    depositIntent: DepositIntent,
    gateway: Gateway,
  ): Promise<TransactionObject<string>> {
    const cogatewayAddress = gateway.gatewayGA;
    const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(this.auxiliaryWeb3, cogatewayAddress);

    const blockNumber = gateway.remoteGatewayLastProvenBlockNumber;
    const offset = await erc20Cogateway.methods.outboxStorageIndex().call();
    const proof = await new ProofGenerator(this.originWeb3).generate(
      message.gatewayAddress,
      blockNumber.toString(10),
      offset.toString(),
      [message.messageHash],
    );

    assert(proof.storageProof.length > 0);

    if (proof.storageProof[0].value === '0') {
      throw new Error('Storage proof is invalid');
    }

    return erc20Cogateway.methods.confirmDeposit(
      (depositIntent.tokenAddress as string),
      (depositIntent.amount as BigNumber).toString(10),
      depositIntent.beneficiary as string,
      (message.feeGasPrice as BigNumber).toString(10),
      (message.feeGasLimit as BigNumber).toString(10),
      message.sender as string,
      blockNumber.toString(10),
      // @ts-ignore
      proof.storageProof[0].serializedProof,
    );
  }
}
