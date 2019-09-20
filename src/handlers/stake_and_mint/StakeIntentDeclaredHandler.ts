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
import Logger from '../../Logger';

import Message from '../../models/Message';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../repositories/MessageRepository';
import ContractEntityHandler from '../ContractEntityHandler';
import Utils from '../../Utils';

/**
 * This class handles stake intent declared transactions.
 */
export default class StakeIntentDeclaredHandler extends ContractEntityHandler<Message> {
  /* Storage */

  private readonly messageRepository: MessageRepository;

  public constructor(messageRepository: MessageRepository) {
    super();

    this.messageRepository = messageRepository;
  }

  /**
   * This method parses stake intent declare transaction and returns message model object.
   *
   * @param transactions Transaction objects.
   *
   * @return Array of instances of message model objects.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async persist(transactions: any[]): Promise<Message[]> {
    Logger.debug('Started persisting Stake intent declared records');
    const models: Message[] = await Promise.all(transactions.map(
      async (transaction): Promise<Message> => {
        let message = await this.messageRepository.get(transaction._messageHash);
        // This will happen if some other facilitator has accepted the stake request.
        if (message === null) {
          message = new Message(transaction._messageHash);
          message.sender = Utils.toChecksumAddress(transaction._staker);
          message.nonce = new BigNumber(transaction._stakerNonce);
          message.direction = MessageDirection.OriginToAuxiliary;
          message.type = MessageType.Stake;
          message.gatewayAddress = Utils.toChecksumAddress(transaction.contractAddress);
          message.sourceStatus = MessageStatus.Undeclared;
          message.sourceDeclarationBlockHeight = new BigNumber(transaction.blockNumber);
          Logger.debug(`Creating message object ${JSON.stringify(message)}`);
        }
        if (message.sourceStatus === MessageStatus.Undeclared) {
          message.sourceStatus = MessageStatus.Declared;
          message.sourceDeclarationBlockHeight = new BigNumber(transaction.blockNumber);
          Logger.debug(`Change message status to ${MessageStatus.Declared}`);
        }
        return message;
      },
    ));

    const savePromises = [];
    for (let i = 0; i < models.length; i += 1) {
      Logger.debug(`Changing source status to declared for message hash ${models[i].messageHash}`);
      savePromises.push(this.messageRepository.save(models[i]));
    }

    await Promise.all(savePromises);
    Logger.debug('Messages saved');
    return models;
  }
}
