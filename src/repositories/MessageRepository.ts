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
  DataTypes, Model, InitOptions, Op, fn, col,
} from 'sequelize';
import BigNumber from 'bignumber.js';
// import Subject from '../observer/Subject';

import assert = require('assert');

export class MessageModel extends Model {
  public readonly messageHash!: string;

  public readonly type!: string;

  public readonly gatewayAddress!: string;

  public readonly sourceStatus!: string;

  public readonly targetStatus!: string;

  public readonly gasPrice!: BigNumber;

  public readonly gasLimit!: BigNumber;

  public readonly nonce!: BigNumber;

  public readonly sender!: string;

  public readonly direction!: string;

  public readonly sourceDeclarationBlockHeight!: BigNumber;

  public readonly secret!: string;

  public readonly hashLock!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

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

export class MessageRepository { // extends Subject<Message> {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    // super();

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
      // this.newUpdate(message);
      return message;
    } catch (e) {
      const errorContext = {
        attributes: messageAttributes,
        reason: e.message,
      };
      return Promise.reject(new Error(`Failed to create a message: ${JSON.stringify(errorContext)}`));
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
   */
  public async update(messageAttributes: MessageAttributes): Promise<boolean> {
    const [updatedRowCount] = await MessageModel.update({
      secret: messageAttributes.secret,
      hashLock: messageAttributes.hashLock,
    }, {
      where: {
        messageHash: {
          [Op.eq]: messageAttributes.messageHash,
        },
      },
    });

    assert(
      updatedRowCount <= 1,
      'As a message hash is a primary key, one or no entry should be affected.',
    );

    if (updatedRowCount === 1) {
      const message = await this.get(messageAttributes.messageHash);
      assert(message !== null);
      // this.newUpdate(message as Message);

      return true;
    }

    return false;
  }

  /**
   * This return gateways which has pending stake and mint messages at or below given block.
   *
   * @param gateways List of gateway address.
   * @param blockHeight Height below which pending messages needs to be checked.
   */
  public async getGatewaysWithPendingOriginMessages(
    gateways: string[],
    blockHeight: BigNumber,
  ): Promise<string[]> {
    const messageModels = await MessageModel.findAll({
      attributes: [[fn('DISTINCT', col('gateway_address')), 'gatewayAddress']],
      where: {
        [Op.and]: {
          gatewayAddress: {
            [Op.in]: gateways,
          },
          sourceDeclarationBlockHeight: {
            [Op.lte]: blockHeight,
          },
          sourceStatus: MessageStatus.Declared,
          direction: MessageDirection.OriginToAuxiliary,
        },

      },
    });
    return messageModels.map((model: MessageModel) => model.gatewayAddress);
  }

  /**
   * This method checks if there are pending messages for a gateway at or below at
   * given block height.
   *
   * @param blockHeight Block height where pending messages needs to be checked.
   * @param gateway Address of gateway.
   */
  public async hasPendingOriginMessages(
    blockHeight: BigNumber,
    gateway: string,

  ): Promise<boolean> {
    return MessageModel.count({
      where: {
        [Op.and]: {
          gatewayAddress: gateway,
          sourceDeclarationBlockHeight: {
            [Op.lte]: blockHeight,
          },
          sourceStatus: MessageStatus.Declared,
          direction: MessageDirection.OriginToAuxiliary,
        },
      },
    }).then((count: number) => count > 0);
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
