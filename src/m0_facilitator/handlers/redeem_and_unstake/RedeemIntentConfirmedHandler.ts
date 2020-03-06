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

import ContractEntityHandler from '../../../common/handlers/ContractEntityHandler';
import Logger from '../../../common/Logger';

import Message from '../../models/Message';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../repositories/MessageRepository';
import Utils from '../../Utils';

/**
 * This class handles RedeemIntentConfirmed event.
 */
export default class RedeemIntentConfirmedHandler extends ContractEntityHandler {
  private messageRepository: MessageRepository;

  /**
   * @param messageRepository Instance of MessageRepository.
   */
  public constructor(messageRepository: MessageRepository) {
    super();
    this.messageRepository = messageRepository;
  }

  /**
   * This method parse confirm redeem intent transaction and returns Message model object.
   *
   * @param transactions Transaction objects.
   * @return Array of instances of Message objects.
   */
  public async handle(transactions: any[]): Promise<void> {
    let message: Message | null;
    Logger.debug(`Handling Redeem intent confirm records: ${transactions.length}`);
    const models: Message[] = await Promise.all(transactions.map(
      async (transaction): Promise<Message> => {
        const messageHash = transaction._messageHash;
        message = await this.messageRepository.get(messageHash);
        if (message === null) {
          message = new Message(
            transaction._messageHash,
            MessageType.Redeem,
            MessageDirection.AuxiliaryToOrigin,
          );
          message.gatewayAddress = transaction.contractAddress;
          message.sender = Utils.toChecksumAddress(transaction._redeemer);
          message.nonce = new BigNumber(transaction._redeemerNonce);
          message.targetStatus = MessageStatus.Undeclared;
          message.hashLock = transaction._hashLock;
          Logger.debug(`Creating a new message for message hash ${transaction._messageHash}`);
        }
        if (message.targetStatus === undefined
          || message.targetStatus === MessageStatus.Undeclared) {
          message.targetStatus = MessageStatus.Declared;
        }
        return message;
      },
    ));

    const savePromises = [];
    for (let i = 0; i < models.length; i += 1) {
      Logger.debug(`Changing target status to declared for message hash ${models[i].messageHash}`);
      savePromises.push(
        this.messageRepository.save(models[i]).catch((error) => {
          Logger.error('RedeemIntentConfirmedHandler error', error);
        }),
      );
    }

    await Promise.all(savePromises);
    Logger.debug('Messages saved');
  }
}
