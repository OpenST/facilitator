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
import Logger from '../../../common/Logger';

import Message from '../../models/Message';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../repositories/MessageRepository';
import ContractEntityHandler from '../ContractEntityHandler';
import Utils from '../../Utils';
import MessageTransferRequestRepository from '../../repositories/MessageTransferRequestRepository';
import MessageTransferRequest from '../../models/MessageTransferRequest';

/**
 * This class handles stake intent declared transactions.
 */
export default class StakeIntentDeclaredHandler extends ContractEntityHandler<Message> {
  /* Storage */

  private readonly messageRepository: MessageRepository;

  private readonly messageTransferRequestRepository: MessageTransferRequestRepository;

  public constructor(
    messageRepository: MessageRepository,
    messageTransferRequestRepository: MessageTransferRequestRepository,
  ) {
    super();

    this.messageRepository = messageRepository;
    this.messageTransferRequestRepository = messageTransferRequestRepository;
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
    Logger.debug(`Persisting Stake intent declared records: ${transactions.length}`);
    const stakeRequestModels: MessageTransferRequest[] = [];
    const messageModels: Message[] = await Promise.all(transactions.map(
      async (transaction): Promise<Message> => {
        let message = await this.messageRepository.get(transaction._messageHash);
        // This will happen if some other facilitator has accepted the stake request.
        if (message === null) {
          message = new Message(
            transaction._messageHash,
            MessageType.Stake,
            MessageDirection.OriginToAuxiliary,
          );
          message.sender = Utils.toChecksumAddress(transaction._staker);
          message.nonce = new BigNumber(transaction._stakerNonce);
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
        // Update messageHash in messageTransferRequestRepository
        const stakeRequest = await this.messageTransferRequestRepository.getBySenderProxyNonce(
          transaction._staker,
          message.nonce!,
        );
        if (stakeRequest && !stakeRequest.messageHash) {
          stakeRequest.messageHash = message.messageHash;
          stakeRequestModels.push(stakeRequest);
        }
        return message;
      },
    ));

    const saveStakeRequestPromises = [];
    for (let i = 0; i < stakeRequestModels.length; i += 1) {
      Logger.debug(`Updating message hash in stakeRequest for requestHash:
      ${stakeRequestModels[i].requestHash}`);
      saveStakeRequestPromises.push(
        this.messageTransferRequestRepository.save(stakeRequestModels[i]),
      );
    }
    await Promise.all(saveStakeRequestPromises);
    Logger.debug('stakeRequests saved');

    const saveMessagesPromises = [];
    for (let i = 0; i < messageModels.length; i += 1) {
      Logger.debug(`Changing source status to declared for messageHash:
      ${messageModels[i].messageHash}`);
      saveMessagesPromises.push(this.messageRepository.save(messageModels[i]));
    }
    await Promise.all(saveMessagesPromises);
    Logger.debug('Messages saved');

    return messageModels;
  }
}
