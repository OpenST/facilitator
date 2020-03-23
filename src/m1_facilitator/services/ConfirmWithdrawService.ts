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

import assert from 'assert';
import Mosaic from 'Mosaic';
import Web3 from 'web3';
import { TransactionObject } from 'web3/eth/types';
import BigNumber from 'bignumber.js';
import ProofGenerator from '../../common/ProofGenerator';

import Gateway from '../models/Gateway';
import Logger from '../../common/Logger';
import Message, { MessageType } from '../models/Message';
import MessageRepository from '../repositories/MessageRepository';
import Observer from '../../common/observer/Observer';
import WithdrawIntentRepository from '../repositories/WithdrawIntentRepository';
import TransactionExecutor from '../lib/TransactionExecutor';
import WithdrawIntent from '../models/WithdrawIntent';

/**
 * Class collects all non confirmed pending messages for withdraw and confirms those messages.
 */
export default class ConfirmWithdrawService extends Observer<Gateway> {
  /** Instance of origin Web3. */
  private originWeb3: Web3;

  /** Instance of auxiliary Web3. */
  private auxiliaryWeb3: Web3;

  /** Instance of message repository. */
  private messageRepository: MessageRepository;

  /** Instance of withdraw intent repository. */
  private withdrawIntentRepository: WithdrawIntentRepository;

  /** Instance of origin transaction executor. */
  private originTransactionExecutor: TransactionExecutor;


  /**
   * Construct ConfirmDepositService with the params.
   *
   * @param originWeb3 Instance of origin web3.
   * @param auxiliaryWeb3 Instance of auxiliary web3.
   * @param messageRepository Instance of message Repository.
   * @param withdrawIntentRepository Instance of withdraw intent repository.
   * @param originTransactionExecutor Instance of origin transaction executor.
   */
  public constructor(
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    messageRepository: MessageRepository,
    withdrawIntentRepository: WithdrawIntentRepository,
    originTransactionExecutor: TransactionExecutor,
  ) {
    super();
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.messageRepository = messageRepository;
    this.withdrawIntentRepository = withdrawIntentRepository;
    this.originTransactionExecutor = originTransactionExecutor;
  }

  public async update(gateways: Gateway[]): Promise<void> {
    Logger.info(`ConfirmWithdrawService::updated gateway records: ${gateways.length}`);
    const confirmMessagePromises = gateways.map(async (gateway): Promise<void> => {
      const messages = await this.messageRepository.getPendingMessagesByGateway(
        gateway.remoteGA,
        MessageType.Withdraw,
        gateway.remoteGatewayLastProvenBlockNumber,
      );

      if (messages.length > 0) {
        await this.confirmMessages(messages, gateway);
      }
    });

    await Promise.all(confirmMessagePromises);
  }

  /**
   * Creates and send confirm withdraw transaction.
   *
   * @param messages List of messages which needs to be confirmed.
   * @param gateway Instance of gateway contract.
   */
  private async confirmMessages(messages: Message[], gateway: Gateway): Promise<void> {
    const confirmMessageTransactionPromises = messages.map(async (message): Promise<void> => {
      const withdrawIntent = await this.withdrawIntentRepository.get(message.messageHash);
      if (withdrawIntent !== null) {
        try {
          const rawTransaction = await this.confirmWithdrawIntentTransaction(
            message,
            withdrawIntent,
            gateway,
          );

          await this.originTransactionExecutor.add(gateway.gatewayGA, rawTransaction);
        } catch (err) {
          Logger.error(`ConfirmWithdrawService::confirmWithdrawIntentTransaction error: ${err}`);
        }
      }
    });
    await Promise.all(confirmMessageTransactionPromises);
  }

  /**
   * Creates confirm withdraw raw transaction.
   *
   * @param message Message Object.
   * @param withdrawIntent Deposit intent object.
   * @param gateway Gateway object.
   */
  private async confirmWithdrawIntentTransaction(
    message: Message,
    withdrawIntent: WithdrawIntent,
    gateway: Gateway,
  ): Promise<TransactionObject<string>> {
    const gatewayAddress = gateway.gatewayGA;
    const erc20gateway = Mosaic.interacts.getERC20Gateway(this.originWeb3, gatewayAddress);

    const blockNumber = gateway.remoteGatewayLastProvenBlockNumber;
    const offset = await erc20gateway.methods.outboxStorageIndex().call();

    const proof = await new ProofGenerator(this.auxiliaryWeb3).generate(
      message.gatewayAddress,
      blockNumber.toString(10),
      offset.toString(),
      [message.messageHash],
    );

    const utilityTokenInteract = Mosaic.interacts.getUtilityToken(
      this.auxiliaryWeb3,
      withdrawIntent.tokenAddress,
    );

    const valueToken = await utilityTokenInteract.methods.valueToken().call();
    Logger.debug(`ConfirmWithdrawService::Storage Proof ${JSON.stringify(proof.storageProof[0])}`);
    assert(proof.storageProof.length > 0);

    if (proof.storageProof[0].value === '0') {
      throw new Error('ConfirmWithdrawService::Storage proof is invalid');
    }
    return erc20gateway.methods.confirmWithdraw(
      (withdrawIntent.tokenAddress as string),
      valueToken,
      (withdrawIntent.amount as BigNumber).toString(10),
      withdrawIntent.beneficiary as string,
      (message.feeGasPrice as BigNumber).toString(10),
      (message.feeGasLimit as BigNumber).toString(10),
      message.sender as string,
      blockNumber.toString(10),
      // @ts-ignore
      proof.storageProof[0].serializedProof,
    );
  }
}
