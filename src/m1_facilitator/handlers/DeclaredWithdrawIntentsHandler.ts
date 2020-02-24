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

import BigNumber from 'bignumber.js';

import WithdrawIntentRepository
  from '../repositories/WithdrawIntentRepository';
import MessageRepository from '../repositories/MessageRepository';
import Message, { MessageStatus, MessageType } from '../models/Message';
import WithdrawIntent from '../models/WithdrawIntent';
import GatewayRepository from '../repositories/GatewayRepository';

/**
 * This class handles the updates from DeclaredWithdrawIntents.
 */
export default class DeclaredWithdrawIntentsHandler {
  /* Withdraw intent repository. */
  private withdrawIntentRepository: WithdrawIntentRepository;

  /* Gateway repository instance. */
  private gatewayRepository: GatewayRepository;

  /* Message repository. */
  private messageRepository: MessageRepository;


  /**
   * Construct DeclaredWithdrawIntentsHandler with params.
   * @param withdrawIntentRepository Instance of withdraw intent repository.
   * @param messageRepository Instance of message repository.
   * @param gatewayRepository Instance of gateway repository.
   */
  public constructor(
    withdrawIntentRepository: WithdrawIntentRepository,
    messageRepository: MessageRepository,
    gatewayRepository: GatewayRepository,
  ) {
    this.gatewayRepository = gatewayRepository;
    this.withdrawIntentRepository = withdrawIntentRepository;
    this.messageRepository = messageRepository;
  }

  /**
   * Handles DeclaredWithdrawIntents entity records.
   * - It creates a message record and updates it's source status to `Declared`.
   * - It creates `WithdrawIntent` record.
   * - This handler only reacts to the events of cogateways which are populated
   *   during seed data. It silently ignores the events by other cogateways.
   *
   * @param records List of declared withdraw intents.
   */
  public async handle(records: {
    messageHash: string;
    contractAddress: string;
    utilityTokenAddress: string;
    amount: string;
    beneficiary: string;
  }[]): Promise<void> {
    const savePromises = records.map(async (record): Promise<void> => {
      const { messageHash, contractAddress } = record;

      const gatewayRecord = await this.gatewayRepository.get(contractAddress);

      if (gatewayRecord !== null) {
        await this.handleMessage(messageHash, contractAddress);
        await this.handleWithdrawIntent(
          messageHash,
          record.utilityTokenAddress,
          new BigNumber(record.amount),
          record.beneficiary,
        );
      }
    });

    await Promise.all(savePromises);
  }

  /**
   * Handles updates of withdraw intent model.
   *
   * @param messageHash Message hash.
   * @param utilityTokenAddress Address of utility token contract.
   * @param amount Amount in atto.
   * @param beneficiary Address of beneficiary.
   */
  private async handleWithdrawIntent(
    messageHash: string,
    utilityTokenAddress: string,
    amount: BigNumber,
    beneficiary: string,
  ): Promise<void> {
    let withdrawIntentRecord = await this.withdrawIntentRepository.get(messageHash);
    if (withdrawIntentRecord === null) {
      withdrawIntentRecord = new WithdrawIntent(
        messageHash,
        utilityTokenAddress,
        amount,
        beneficiary,
      );
    }
    await this.withdrawIntentRepository.save(withdrawIntentRecord);
  }

  /**
   * Handle updates in message model.
   *
   * @param messageHash Message hash.
   * @param contractAddress Cogateway contract address.
   */
  private async handleMessage(messageHash: string, contractAddress: string): Promise<void> {
    let message = await this.messageRepository.get(messageHash);

    if (message === null) {
      message = new Message(
        messageHash,
        MessageType.Withdraw,
        MessageStatus.Undeclared,
        MessageStatus.Undeclared,
        contractAddress,
      );
    }
    message.sourceStatus = MessageStatus.Declared;
    await this.messageRepository.save(message);
  }
}
