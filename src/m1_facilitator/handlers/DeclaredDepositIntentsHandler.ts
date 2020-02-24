
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
import DepositIntent from '../models/DepositIntent';
import Message, { MessageStatus, MessageType } from '../models/Message';
import GatewayRepository from '../repositories/GatewayRepository';
import DepositIntentRepository from '../repositories/DepositIntentRepository';
import MessageRepository from '../repositories/MessageRepository';
import Utils from '../../common/Utils';
import Logger from '../../m0_facilitator/Logger';

/**
 * It handles updates from DeclaredDepositIntents entity.
 */
export default class DeclaredDepositIntentsHandler {
  /** Instance of DepositIntentRepository. */
  private depositIntentRepository: DepositIntentRepository;

  /** Instance of MessageRepository. */
  private messageRepository: MessageRepository;

  /** Instance of GatewayRepository. */
  private gatewayRepository: GatewayRepository;

  /**
   * Constructor for DeclaredDepositIntentHandler.
   *
   * @param depositIntentRepository Instance of DepositIntentRepository.
   * @param gatewayRepository Instance of GatewayRepository.
   * @param messageRepository Instance of MessageRepository.
   */
  public constructor(
    depositIntentRepository: DepositIntentRepository,
    gatewayRepository: GatewayRepository,
    messageRepository: MessageRepository,
  ) {
    this.depositIntentRepository = depositIntentRepository;
    this.gatewayRepository = gatewayRepository;
    this.messageRepository = messageRepository;
  }

  /**
   * It handles DeclaredDepositIntent entity records.
   * @param records List of DeclaredDepositIntent entity.
   */
  public async handle(records: {
    contractAddress: string;
    messageHash: string;
    intentHash: string;
    tokenAddress: string;
    beneficiary: string;
    amount: BigNumber;
    feeGasPrice: BigNumber;
    feeGasLimit: BigNumber;
    blockNumber: BigNumber;
  }[]): Promise<void> {
    const promisesCollection = records.map(
      async (record): Promise<void> => {
        const isNewMessage = await this.handleMessage(
          record.contractAddress,
          record.messageHash,
          record.feeGasPrice,
          record.feeGasLimit,
          record.blockNumber,
          record.intentHash,
        );
        if (isNewMessage) {
          await this.handleDepositIntent(
            record.messageHash,
            record.tokenAddress,
            record.amount,
            record.beneficiary,
            record.intentHash,
          );
        }
      },
    );
    await Promise.all(promisesCollection);
    Logger.debug('Messages saved');
  }

  /**
   * It updates Message model.
   *
   * @param contractAddress Address of gateway contract.
   * @param messageHash Message hash.
   * @param feeGasPrice Gasprice which depositor/withdrawal will be paying.
   * @param feeGasLimit GasLimit which depositor/withdrawal will be paying.
   * @param blockNumber Block number at which deposit transaction is mined.
   * @param intentHash Deposit intent hash.
   */
  private async handleMessage(
    contractAddress: string,
    messageHash: string,
    feeGasPrice: BigNumber,
    feeGasLimit: BigNumber,
    blockNumber: BigNumber,
    intentHash: string,
  ): Promise<boolean> {
    let messageObj = await this.messageRepository.get(messageHash);
    let isNewMessage = false;
    if (messageObj === null) {
      const gatewayRecord = await this.gatewayRepository.get(contractAddress);
      if (gatewayRecord != null) {
        messageObj = new Message(
          messageHash,
          MessageType.Deposit,
          MessageStatus.Undeclared,
          MessageStatus.Undeclared,
          gatewayRecord.remoteGA,
          new BigNumber(feeGasPrice),
          new BigNumber(feeGasLimit),
          new BigNumber(blockNumber),
          intentHash,
        );
        isNewMessage = true;
        Logger.debug(`Creating message object ${JSON.stringify(messageObj)}`);
      }
    }
    if (messageObj !== null
      && messageObj.sourceStatus === MessageStatus.Undeclared
      && messageObj.type === MessageType.Deposit
    ) {
      messageObj.sourceStatus = MessageStatus.Declared;
      await this.messageRepository.save(messageObj);
    }
    return isNewMessage;
  }

  /**
   * It updates DepositIntent model.
   *
   * @param messageHash Message hash.
   * @param tokenAddress Value token address.
   * @param amount Deposit amount.
   * @param beneficiary Beneficiary address.
   * @param intentHash Intent hash.
   */
  private async handleDepositIntent(
    messageHash: string,
    tokenAddress: string,
    amount: BigNumber,
    beneficiary: string,
    intentHash: string,
  ): Promise<void> {
    const depositIntentObj = await this.depositIntentRepository.get(
      messageHash,
    );
    if (depositIntentObj == null) {
      const depositIntent = new DepositIntent(
        messageHash,
        tokenAddress,
        new BigNumber(amount),
        Utils.toChecksumAddress(beneficiary),
        intentHash,
      );
      await this.depositIntentRepository.save(depositIntent);
      Logger.debug(`Deposit intent ${depositIntent} saved.`);
    }
  }
}
