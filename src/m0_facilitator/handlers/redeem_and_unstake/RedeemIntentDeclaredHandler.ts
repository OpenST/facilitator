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

import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../repositories/MessageRepository';
import Message from '../../models/Message';
import MessageTransferRequest from '../../models/MessageTransferRequest';
import MessageTransferRequestRepository from '../../repositories/MessageTransferRequestRepository';
import Utils from '../../Utils';

/**
 * This class handles redeem intent declared transactions.
 */
export default class RedeemIntentDeclaredHandler extends ContractEntityHandler {
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
   * This method parses redeem intent declare transaction and returns message model object.
   *
   * @param transactions Transaction objects.
   *
   * @return Array of instances of message model objects.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async handle(transactions: any[]): Promise<void> {
    Logger.debug(`Handling Redeem intent declared records: ${transactions.length}`);
    const redeemRequestModels: MessageTransferRequest[] = [];
    const messageModels: Message[] = await Promise.all(transactions.map(
      async (transaction): Promise<Message> => {
        let message = await this.messageRepository.get(transaction._messageHash);
        // This can happen if some other facilitator has accepted the redeem request.
        if (message === null) {
          message = new Message(
            transaction._messageHash,
            MessageType.Redeem,
            MessageDirection.AuxiliaryToOrigin,
          );
          message.sender = Utils.toChecksumAddress(transaction._redeemer);
          message.nonce = new BigNumber(transaction._redeemerNonce);
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
        const redeemRequest = await this.messageTransferRequestRepository.getBySenderProxyNonce(
          transaction._redeemer,
          message.nonce!,
        );
        if (redeemRequest && !redeemRequest.messageHash) {
          redeemRequest.messageHash = message.messageHash;
          redeemRequestModels.push(redeemRequest);
        }
        return message;
      },
    ));

    const saveRedeemRequestPromises = [];
    for (let i = 0; i < redeemRequestModels.length; i += 1) {
      Logger.debug(`Updating message hash in redeemRequest for requestHash:
      ${redeemRequestModels[i].requestHash}`);
      saveRedeemRequestPromises.push(
        this.messageTransferRequestRepository.save(redeemRequestModels[i]),
      );
    }
    await Promise.all(saveRedeemRequestPromises);
    Logger.debug('redeemRequests saved');

    const saveMessagesPromises = [];
    for (let i = 0; i < messageModels.length; i += 1) {
      Logger.debug(`Changing source status to declared for message hash ${messageModels[i].messageHash}`);
      saveMessagesPromises.push(this.messageRepository.save(messageModels[i]));
    }
    await Promise.all(saveMessagesPromises);
    Logger.debug('Messages saved');
  }
}
