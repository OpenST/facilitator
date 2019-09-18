import assert from 'assert';
import BigNumber from 'bignumber.js';
import {
  DataTypes, InitOptions, Model, Op,
} from 'sequelize';

import Message from '../models/Message';
import Subject from '../observer/Subject';
import Utils from '../Utils';

/* eslint-disable class-methods-use-this */

/**
 * An interface, that represents a row from a messages table.
 *
 * MessageModel has been exported so that
 * MessageTransferRequestRepository::MessageTransferRequestModel can make
 * belongsTo association. It's recommended to not use MessageModel for external use. Use
 * models/Message.ts to represent Message model objects.
 */
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


/** Message types for stake and redeem. */
export enum MessageType {
  Stake = 'stake',
  Redeem = 'redeem',
}

/** Status of messages */
export enum MessageStatus {
  Undeclared = 'undeclared',
  Declared = 'declared',
  Progressed = 'progressed',
  RevocationDeclared = 'revocation_declared',
  Revoked = 'revoked',
}

/** Direction of messages. o2a: Origin to auxiliary,  a2o: Auxiliary to origin */
export enum MessageDirection {
  OriginToAuxiliary = 'o2a',
  AuxiliaryToOrigin = 'a2o',
}

/**
 * Stores instances of Message.
 *
 * Class enables creation, update and retrieval of Message objects.
 * On construction it initializes underlying database model.
 */
export class MessageRepository extends Subject<Message> {
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
          allowNull: true,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        sourceStatus: {
          type: DataTypes.ENUM({
            values: [
              MessageStatus.Undeclared,
              MessageStatus.Declared,
              MessageStatus.Progressed,
              MessageStatus.RevocationDeclared,
              MessageStatus.Revoked,
            ],
          }),
          allowNull: true,
        },
        targetStatus: {
          type: DataTypes.ENUM({
            values: [
              MessageStatus.Undeclared,
              MessageStatus.Declared,
              MessageStatus.Progressed,
              MessageStatus.Revoked,
            ],
          }),
          allowNull: true,
        },
        gasPrice: {
          type: DataTypes.BIGINT,
          allowNull: true,
          validate: {
            min: 0,
          },
        },
        gasLimit: {
          type: DataTypes.BIGINT,
          allowNull: true,
          validate: {
            min: 0,
          },
        },
        nonce: {
          type: DataTypes.BIGINT,
          allowNull: true,
          validate: {
            min: 0,
          },
        },
        sender: {
          type: DataTypes.STRING,
          allowNull: true,
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
          allowNull: true,
          validate: {
            min: 0,
          },
        },
        secret: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isAlphanumeric: true,
          },
        },
        hashLock: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isAlphanumeric: true,
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
   * If a Message does not exist, it creates, otherwise updates.
   *
   * @param message Message object.
   *
   * @returns Newly created or updated Message object.
   */
  public async save(message: Message): Promise<Message> {
    const definedOwnProps: string[] = Utils.getDefinedOwnProps(message);

    await MessageModel.upsert(
      message,
      {
        fields: definedOwnProps,
      },
    );

    const updatedMessage = await this.get(
      message.messageHash,
    );
    assert(
      updatedMessage !== null,
      `Updated message record not found for messageHash: ${message.messageHash}`,
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

  /**
   * This returns stake and mint messages for a given address with sourceStatus declared, target
   * status undeclared below or equal to the given block height.
   *
   * @param gatewayAddress Address of the gateway.
   * @param blockHeight Block height at which Gateway is proven.
   * @param direction origin => aux or aux => origin
   */
  public async getMessagesForConfirmation(
    gatewayAddress: string,
    blockHeight: BigNumber,
    direction: MessageDirection,
  ): Promise<Message[]> {
    const messageModels = await MessageModel.findAll({
      where: {
        [Op.and]: {
          gatewayAddress,
          sourceDeclarationBlockHeight: {
            [Op.lte]: blockHeight,
          },
          sourceStatus: MessageStatus.Declared,
          targetStatus: MessageStatus.Undeclared,
          direction,
        },
      },
    });

    const messages: Message[] = messageModels.map(
      message => this.convertToMessage(message),
    );
    return messages;
  }

  /* Private Functions */

  /**
   * It converts Message db object to Message model object.
   *
   * @param messageModel MessageModel object to convert.
   *
   * @returns Message object.
   */
  private convertToMessage(messageModel: MessageModel): Message {
    return new Message(
      messageModel.messageHash,
      messageModel.type,
      messageModel.gatewayAddress,
      messageModel.sourceStatus,
      messageModel.targetStatus,
      new BigNumber(messageModel.gasPrice),
      new BigNumber(messageModel.gasLimit),
      new BigNumber(messageModel.nonce),
      messageModel.sender,
      messageModel.direction,
      new BigNumber(messageModel.sourceDeclarationBlockHeight),
      messageModel.secret,
      messageModel.hashLock,
      messageModel.createdAt,
      messageModel.updatedAt,
    );
  }
}
