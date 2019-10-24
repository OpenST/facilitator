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

import assert from 'assert';
import BigNumber from 'bignumber.js';
import {
  DataTypes, InitOptions, Model, Op,
} from 'sequelize';

import MessageTransferRequest from '../models/MessageTransferRequest';
import Subject from '../observer/Subject';
import Utils from '../Utils';
import { MessageModel } from './MessageRepository';
import { MAX_VALUE } from '../Constants';


/**
 * An interface, that represents a row for MessageTransferRequest(stake/redeem) table.
 *
 * See: http://docs.sequelizejs.com/manual/typescript.html#usage
 */
class MessageTransferRequestModel extends Model {
  public readonly requestHash!: string;

  public readonly requestType!: RequestType;

  public readonly messageHash!: string;

  public readonly amount!: BigNumber;

  public readonly beneficiary!: string;

  public readonly gasPrice!: BigNumber;

  public readonly gasLimit!: BigNumber;

  public readonly nonce!: BigNumber;

  public readonly gateway!: string;

  public readonly sender!: string;

  public readonly senderProxy!: string;

  public readonly blockNumber!: BigNumber;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Request types which facilitator can process
 */
export enum RequestType {
  Stake = 'stake',
  Redeem = 'redeem',
}

/**
 * Stores instances of MessageTransferRequest.
 *
 * Class enables creation, update and retrieval of MessageTransferRequest objects for stake/redeem.
 * On construction it initializes underlying database model.
 */
export default class MessageTransferRequestRepository extends Subject<MessageTransferRequest> {
  /* Public Functions */

  /**
   * Initializes an underlying model and a database table.
   * Creates database table if it does not exist.
   */
  public constructor(initOptions: InitOptions) {
    super();

    MessageTransferRequestModel.init(
      {
        requestHash: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        requestType: {
          type: DataTypes.ENUM({
            values: [RequestType.Stake, RequestType.Redeem],
          }),
          allowNull: false,
        },
        blockNumber: {
          type: DataTypes.BIGINT,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        messageHash: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        amount: {
          type: DataTypes.DECIMAL(78),
          allowNull: false,
          validate: {
            min: 0,
            max: MAX_VALUE,
          },
        },
        beneficiary: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        gasPrice: {
          type: DataTypes.DECIMAL(78),
          allowNull: false,
          validate: {
            min: 0,
            max: MAX_VALUE,
          },
        },
        gasLimit: {
          type: DataTypes.DECIMAL(78),
          allowNull: false,
          validate: {
            min: 0,
            max: MAX_VALUE,
          },
        },
        nonce: {
          type: DataTypes.BIGINT,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        gateway: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
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
        senderProxy: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
      },
      {
        ...initOptions,
        modelName: 'MessageTransferRequest',
        tableName: 'requests',
      },
    );

    MessageTransferRequestModel.belongsTo(MessageModel, { foreignKey: 'messageHash' });
  }

  /**
   * Saves a stake/redeem request model in the repository.
   * If a stake/redeem request does not exist, it creates, otherwise updates.
   *
   * Function ignores (does not set to null) undefined (optional) fields
   * from the passed stake/redeem request object.
   *
   * @param request  request object to update.
   *
   * @returns Newly created or updated stake/redeem request object (with all saved fields).
   */
  public async save(request: MessageTransferRequest): Promise<MessageTransferRequest> {
    const messageTransferRequestModelObj = await MessageTransferRequestModel.findOne(
      {
        where: {
          requestHash: request.requestHash,
        },
      },
    );

    let requestOutput: MessageTransferRequest | null;
    if (messageTransferRequestModelObj === null) {
      requestOutput = this.convertToRequest(await MessageTransferRequestModel.create(
        request,
      ));
    } else {
      const definedOwnProps: string[] = Utils.getDefinedOwnProps(request);
      await MessageTransferRequestModel.update(
        request,
        {
          where: {
            requestHash: request.requestHash,
          },
          fields: definedOwnProps,
        },
      );
      requestOutput = await this.get(
        request.requestHash,
      );
    }

    assert(
      requestOutput !== null,
      `Updated request not found for requestHash: ${request.requestHash}`,
    );

    this.newUpdate(requestOutput as MessageTransferRequest);

    return requestOutput as MessageTransferRequest;
  }

  /**
   * Returns a stake/redeem message transfer request with the specified stake/redeem request's
   * hash or null if there is no.
   *
   * @param requestHash Request's hash to retrieve.
   *
   * @return MessageTransferRequest object if exists, otherwise null.
   */
  public async get(requestHash: string): Promise<MessageTransferRequest | null> {
    const requestModel = await MessageTransferRequestModel.findOne({
      where: {
        requestHash,
      },
    });

    if (requestModel === null) {
      return null;
    }

    return this.convertToRequest(requestModel);
  }

  /**
   * Returns a stake/redeem request with the specified message hash or
   * null if there is no.
   *
   * @param messageHash Message hash to be used for retrieval.
   *
   * @return MessageTransferRequest object if exists, otherwise null.
   */
  public async getByMessageHash(messageHash: string): Promise<MessageTransferRequest | null> {
    const requestModel = await MessageTransferRequestModel.findOne({
      where: {
        messageHash,
      },
    });

    if (requestModel === null) {
      return null;
    }

    return this.convertToRequest(requestModel);
  }

  /**
   * Gets all stake/redeem requests with a null message hash.
   */
  public async getWithNullMessageHash(): Promise<MessageTransferRequest[]> {
    const requestModels: MessageTransferRequestModel[] = await MessageTransferRequestModel.findAll({
      where: {
        messageHash: null,
      },
    });

    return this.convertToRequests(requestModels);
  }

  /**
   * Returns a message transfer request by senderProxy and nonce.
   *
   * @param senderProxy sender proxy address.
   * @param nonce Nonce of request.
   *
   * @return MessageTransferRequest object if exists, otherwise null.
   */
  public async getBySenderProxyNonce(senderProxy: string, nonce: BigNumber):
  Promise<MessageTransferRequest | null> {
    const requestModel = await MessageTransferRequestModel.findOne({
      where: {
        senderProxy: {
          [Op.eq]: senderProxy,
        },
        nonce: {
          [Op.eq]: nonce,
        },
      },
    });

    if (requestModel === null) {
      return null;
    }

    return this.convertToRequest(requestModel);
  }


  /* Private Functions */

  private convertToRequest(requestModel: MessageTransferRequestModel): MessageTransferRequest {
    const request = new MessageTransferRequest(
      requestModel.requestHash,
      requestModel.requestType,
      new BigNumber(requestModel.blockNumber),
      new BigNumber(requestModel.amount),
      requestModel.beneficiary,
      new BigNumber(requestModel.gasPrice),
      new BigNumber(requestModel.gasLimit),
      new BigNumber(requestModel.nonce),
      requestModel.gateway,
      requestModel.sender,
      requestModel.senderProxy,
    );

    request.messageHash = requestModel.messageHash;
    request.createdAt = requestModel.createdAt;
    request.updatedAt = requestModel.updatedAt;

    return request;
  }

  private convertToRequests(requestModels: MessageTransferRequestModel[]):
  MessageTransferRequest[] {
    const requests: MessageTransferRequest[] = [];
    for (let i = 0; i < requestModels.length; i += 1) {
      requests.push(this.convertToRequest(requestModels[i]));
    }

    return requests;
  }
}
