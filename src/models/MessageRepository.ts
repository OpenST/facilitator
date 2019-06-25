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

/* eslint-disable class-methods-use-this */

import {
  DataTypes, Model, InitOptions, Op,
} from 'sequelize';
import BigNumber from 'bignumber.js';
import Subject from '../observer/Subject';

export class MessageModel extends Model {}

/**
 * To be used for calling any methods which would change states of record(s) in Database.
 */
export interface MessageAttributes {
  messageHash: string;
  type: string;
  gatewayAddress: string;
  sourceStatus: string;
  targetStatus: string;
  gasPrice: BigNumber;
  gasLimit: BigNumber;
  nonce: BigNumber;
  sender: string;
  direction: string;
  sourceDeclarationBlockHeight: BigNumber;
  secret?: string;
  hashLock?: string;
}

/**
 * Repository would always return database rows after typecasting to this
 */
export interface Message extends MessageAttributes{
  createdAt: Date;
  updatedAt: Date;
}

export enum MessageType {
  Stake = 'stake',
  Redeem = 'redeem',
}

export enum MessageStatus {
  Undeclared = 'undeclared',
  Declared = 'declared',
  Progressed = 'progressed',
  RevocationDeclared = 'revocation_declared',
  Revoked = 'revoked',
}

export enum MessageDirection {
  OriginToAuxiliary = 'o2a',
  AuxiliaryToOrigin = 'a2o',
}

export class MessageRepository extends Subject {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    super();

    MessageModel.init(
      {
        messageHash: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        type: {
          type: DataTypes.ENUM({
            values: [MessageType.Stake, MessageType.Redeem],
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
        sourceStatus: {
          type: DataTypes.ENUM({
            values: [
              MessageStatus.Declared,
              MessageStatus.Progressed,
              MessageStatus.RevocationDeclared,
              MessageStatus.Revoked,
              MessageStatus.Undeclared,
            ],
          }),
          allowNull: false,
        },
        targetStatus: {
          type: DataTypes.ENUM({
            values: [
              MessageStatus.Declared,
              MessageStatus.Progressed,
              MessageStatus.Revoked,
              MessageStatus.Undeclared,
            ],
          }),
          allowNull: false,
        },
        gasPrice: {
          type: DataTypes.BIGINT,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        gasLimit: {
          type: DataTypes.BIGINT,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        nonce: {
          type: DataTypes.BIGINT,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        sender: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        direction: {
          type: DataTypes.ENUM({
            values: [MessageDirection.OriginToAuxiliary, MessageDirection.AuxiliaryToOrigin],
          }),
          allowNull: false,
        },
        sourceDeclarationBlockHeight: {
          type: DataTypes.BIGINT,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        secret: {
          type: DataTypes.STRING,
          validate: {
            isAlphanumeric: true,
          },
        },
        hashLock: {
          type: DataTypes.STRING,
          validate: {
            isAlphanumeric: true,
          },
        },
      },
      {
        ...initOptions,
        modelName: 'message',
        tableName: 'message',
      },
    );
  }

  /**
   * Creates a message model in the repository and syncs with database.
   * @param {MessageAttributes} messageAttributes
   * @return {Promise<Message>}
   */
  public async create(messageAttributes: MessageAttributes): Promise<Message> {
    try {
      const message: Message = await MessageModel.create(messageAttributes);
      this.format(message);
      return message;
    } catch (e) {
      const errorContext = {
        attributes: messageAttributes,
        reason: e.message,
      };
      return Promise.reject(`Failed to create a message: ${JSON.stringify(errorContext)}`);
    }
  }

  /**
   * Fetches message data from database.
   * @param {string} messageHash
   * @return {Promise<Message | null>}
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
    const message: Message = messageModel;
    this.format(message);
    return message;
  }

  /**
   * Updates message data in database and does not return the updated state.
   * @param {MessageAttributes} messageAttributes
   * @return {Promise<Array<Number>>}
   */
  public async update(messageAttributes: MessageAttributes): Promise<number[]> {
    return await MessageModel.update({
      secret: messageAttributes.secret,
      hashLock: messageAttributes.hashLock,
    }, {
      where: {
        messageHash: {
          [Op.eq]: messageAttributes.messageHash,
        },
      },
    });
  }

  /**
   * Modifies the message object by typecasting required properties.
   * @param {Message} message
   */
  private format(message: Message): void {
    message.gasPrice = new BigNumber(message.gasPrice);
    message.gasLimit = new BigNumber(message.gasLimit);
    message.nonce = new BigNumber(message.nonce);
    message.sourceDeclarationBlockHeight = new BigNumber(message.sourceDeclarationBlockHeight);
  }
}
