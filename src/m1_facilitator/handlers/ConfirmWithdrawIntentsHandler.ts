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

import ContractEntityHandler from '../../common/handlers/ContractEntityHandler';

import GatewayRepository from '../repositories/GatewayRepository';
import Message, { MessageStatus, MessageType } from '../models/Message';
import MessageRepository from '../repositories/MessageRepository';

import assert = require('assert');

/** Represents record of ConfirmWithdrawIntentsEntity. */
interface ConfirmWithdrawIntentsEntityInterface {
  messageHash: string;
  contractAddress: string;
}

export default class ConfirmWithdrawIntentsHandler extends ContractEntityHandler {
  /* Instance of message repository. */
  private messageRepository: MessageRepository;

  /* Instance of gateway repository. */
  private gatewayRepository: GatewayRepository;

  /**
   * Construct ConfirmWithdrawIntentsHandler with params.
   *
   * @param messageRepository Instance of message repository.
   * @param gatewayRepository Instance of gateway repository.
   */
  public constructor(
    messageRepository: MessageRepository,
    gatewayRepository: GatewayRepository,
  ) {
    super();

    this.gatewayRepository = gatewayRepository;
    this.messageRepository = messageRepository;
  }

  /**
   * Handles the ConfirmWithdrawIntent entity records.
   * - It creates a message record if doesn't exists and updates it's target
   *   status to `Declared`.
   * - This handler only reacts to the events of gateways which are populated
   *   during seed data. It silently ignores the events by the other gateways.
   *
   * @param records List of confirm withdraw intents.
   */
  public async handle(records: ConfirmWithdrawIntentsEntityInterface[]): Promise<void> {
    const savePromises = records.map(async (record): Promise<void> => {
      const gatewayRecord = await this.gatewayRepository.get(record.contractAddress);
      if (gatewayRecord !== null) {
        let message = await this.messageRepository.get(record.messageHash);

        if (message === null) {
          message = new Message(
            record.messageHash,
            MessageType.Withdraw,
            MessageStatus.Undeclared,
            MessageStatus.Undeclared,
            gatewayRecord.remoteGA,
          );
        }
        if (message.targetStatus === MessageStatus.Undeclared) {
          assert(message.type === MessageType.Withdraw);

          message.targetStatus = MessageStatus.Declared;
          await this.messageRepository.save(message);
        }
      }
    });
    await Promise.all(savePromises);
  }
}
