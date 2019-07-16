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
import ContractEntityHandler from './ContractEntityHandler';
import {
  MessageDirection,
  MessageRepository, MessageStatus, MessageType,
} from '../repositories/MessageRepository';
import Message from '../models/Message';
import Logger from '../Logger';

/**
 * This class handles StakeIntentConfirmed event.
 */
export default class ConfirmStakeIntentHandler extends ContractEntityHandler<Message> {
  private messageRepository: MessageRepository;

  /**
   * @param messageRepository Instance of MessageRepository.
   */
  public constructor(messageRepository: MessageRepository) {
    super();
    this.messageRepository = messageRepository;
  }

  /**
   * This method parse confirm stake intent transaction and returns Message model object.
   *
   * @param transactions Transaction objects.
   *
   * @return Array of instances of Message objects.
   */
  public async persist(transactions: any[]): Promise<Message[]> {
    let message: Message | null;
    const models: Message[] = [];
    for (let i = 0; i < transactions.length; i++) {
      const messageHash = transactions[i]._messageHash as string;
      message = await this.messageRepository.get(messageHash);
      message!.sender = transactions[i]._staker as string;
      message!.nonce = transactions[i]._stakerNonce as BigNumber;
      message!.gatewayAddress = transactions[i]._contractAddress;
      message!.type = MessageType.Stake;
      message!.direction = MessageDirection.OriginToAuxiliary;
      message!.targetStatus = MessageStatus.Declared;

      models.push(message!);
    }

    const savePromises = [];
    for (let i = 0; i < models.length; i += 1) {
      savePromises.push(this.messageRepository.save(models[i]));
    }

    await Promise.all(savePromises);

    return models;
  }

  /**
   * This method defines action on receiving message model.
   *
   * @param message array of instances of Message model object.
   */
  public async handle(message: Message[]): Promise<void> {
    Logger.info(`Message model ${message}`);
    return Promise.resolve();
  }
}
