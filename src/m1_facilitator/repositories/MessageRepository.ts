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
import BigNumber from 'bignumber.js';
import { DataTypes, InitOptions, Model } from 'sequelize';
import { MAX_VALUE } from '../../m0_facilitator/Constants';
import Message, { MessageType, MessageStatus } from '../models/Message';
import Subject from '../../m0_facilitator/observer/Subject';
import Utils from '../../m0_facilitator/Utils';

/**
 * An interface, that represents a row from a messages table.
 */
class MessageModel extends Model {
  public readonly messageHash!: string;

  public readonly type!: MessageType;

  public readonly sourceStatus!: MessageStatus;

  public readonly targetStatus!: MessageStatus;

  public readonly gatewayAddress!: string;

  public readonly intentHash!: string;

  public readonly feeGasPrice!: BigNumber;

  public readonly feeGasLimit!: BigNumber;

  public readonly sourceDeclarationBlockNumber!: BigNumber;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Stores instances of Message.
 *
 * Class enables creation, update and retrieval of Message objects.
 * On construction it initializes underlying database model.
 */
export default class MessageRepository extends Subject<Message> {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    super();

    MessageModel.init(
      {
        messageHash: {
          type: DataTypes.STRING,
          primaryKey: true,
          validate: {
            isAlphanumeric: true,
          },
        },
        type: {
          type: DataTypes.ENUM({
            values: [MessageType.Deposit, MessageType.Withdraw],
          }),
          allowNull: false,
        },
        sourceStatus: {
          type: DataTypes.ENUM({
            values: [
              MessageStatus.Undeclared,
              MessageStatus.Declared,
            ],
          }),
          allowNull: false,
        },
        targetStatus: {
          type: DataTypes.ENUM({
            values: [
              MessageStatus.Undeclared,
              MessageStatus.Declared,
            ],
          }),
          allowNull: false,
        },
        gatewayAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        intentHash: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isAlphanumeric: false,
          },
        },
        feeGasPrice: {
          type: DataTypes.DECIMAL(78),
          allowNull: true,
          validate: {
            min: 0,
            max: MAX_VALUE,
          },
        },
        feeGasLimit: {
          type: DataTypes.DECIMAL(78),
          allowNull: true,
          validate: {
            min: 0,
            max: MAX_VALUE,
          },
        },
        sourceDeclarationBlockNumber: {
          type: DataTypes.BIGINT,
          allowNull: true,
          validate: {
            min: 0,
          },
        },
      },
      {
        ...initOptions,
        modelName: 'Message',
        tableName: 'messages',
      },
    );
  }

  /**
   * Saves a Message model in the repository.
   * If a Message does not exist, it creates else it updates.
   *
   * @param message Message object to update.
   *
   * @returns Newly created or updated Message object.
   */
  public async save(message: Message): Promise<Message> {
    const messageModelobj = await MessageModel.findOne(
      {
        where: {
          messageHash: message.messageHash,
        },
      },
    );

    let updatedMessage: Message|null;
    if (messageModelobj === null) {
      updatedMessage = this.convertToMessage(await MessageModel.create(
        message,
      ));
    } else {
      const definedOwnProps: string[] = Utils.getDefinedOwnProps(message);
      await MessageModel.update(
        message,
        {
          where: {
            messageHash: message.messageHash,
          },
          fields: definedOwnProps,
        },
      );
      updatedMessage = await this.get(
        message.messageHash,
      );
    }

    assert(
      updatedMessage !== null,
      `Updated DepositIntent record not found for intent hash: ${message.messageHash}`,
    );

    this.newUpdate(updatedMessage as Message);

    return updatedMessage as Message;
  }

  /**
   * Fetches Message data from database if found. Otherwise returns null.
   *
   * @param messageHash Unique message hash for a message.
   *
   * @returns Message object containing values which satisfy the `where` condition.
   */
  public async get(messageHash: string): Promise<Message | null> {
    const messageModel = await MessageModel.findOne({
      where: {
        messageHash,
      },
    });

    if (messageModel === null) {
      return null;
    }

    return this.convertToMessage(messageModel);
  }

  /* Private Functions */

  /**
   * It converts Message db object to Message model object.
   *
   * @param messageModel MessageModel object to convert.
   *
   * @returns Message object.
   */
  // eslint-disable-next-line class-methods-use-this
  private convertToMessage(messageModel: MessageModel): Message {
    return new Message(
      messageModel.messageHash,
      messageModel.type,
      messageModel.sourceStatus,
      messageModel.targetStatus,
      messageModel.gatewayAddress,
      messageModel.feeGasPrice ? new BigNumber(messageModel.feeGasPrice) : messageModel.feeGasPrice,
      messageModel.feeGasLimit ? new BigNumber(messageModel.feeGasLimit) : messageModel.feeGasLimit,
      messageModel.sourceDeclarationBlockNumber
        ? new BigNumber(messageModel.sourceDeclarationBlockNumber)
        : messageModel.sourceDeclarationBlockNumber,
      messageModel.intentHash,
      messageModel.createdAt,
      messageModel.updatedAt,
    );
  }
}
