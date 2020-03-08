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


import ContractEntityHandler from '../../../common/handlers/ContractEntityHandler';
import Logger from '../../../common/Logger';

import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../repositories/MessageRepository';
import Message from '../../models/Message';
import Utils from '../../Utils';

/**
 * This class handles mint progress transactions.
 */
export default class MintProgressedHandler extends ContractEntityHandler {
  /* Storage */

  private readonly messageRepository: MessageRepository;

  public constructor(messageRepository: MessageRepository) {
    super();

    this.messageRepository = messageRepository;
  }

  /**
   * This method parses progress mint transaction.
   *
   * @param transactions Transaction objects.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async handle(transactions: any[]): Promise<void> {
    Logger.debug(`Handling mint progress records: ${transactions.length}`);
    const models: Message[] = await Promise.all(transactions.map(
      async (transaction): Promise<Message> => {
        let message = await this.messageRepository.get(transaction._messageHash);
        // This will happen if progress transaction appears first..
        if (message === null) {
          message = new Message(
            transaction._messageHash,
            MessageType.Stake,
            MessageDirection.OriginToAuxiliary,
          );
          message.sender = Utils.toChecksumAddress(transaction._staker);
          message.targetStatus = MessageStatus.Undeclared;
          Logger.debug(`Creating a new message for message hash ${transaction._messageHash}`);
        }
        // Undeclared use case can happen when progress event appears before declare event.
        if (message.targetStatus === MessageStatus.Undeclared
          || message.targetStatus === MessageStatus.Declared) {
          message.targetStatus = MessageStatus.Progressed;
        }
        message.secret = transaction._unlockSecret;
        return message;
      },
    ));

    const savePromises = [];
    for (let i = 0; i < models.length; i += 1) {
      Logger.debug(`Changing target status to progress mint for message hash ${models[i].messageHash}`);
      savePromises.push(this.messageRepository.save(models[i]));
    }

    await Promise.all(savePromises);
  }
}
