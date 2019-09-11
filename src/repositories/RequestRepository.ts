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
import { DataTypes, InitOptions, Model } from 'sequelize';

import Request from '../models/Request';
import Subject from '../observer/Subject';
import Utils from '../Utils';
//import { MessageModel } from './MessageRepository';


/**
 * An interface, that represents a row for requests(stake/redeem) table.
 *
 * See: http://docs.sequelizejs.com/manual/typescript.html#usage
 */
class RequestModel extends Model {
  public readonly requestHash!: string;

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
 * Stores instances of Request.
 *
 * Class enables creation, update and retrieval of Request objects.
 * On construction it initializes underlying database model.
 */
export default class RequestRepository extends Subject<Request> {
  /* Public Functions */

  /**
   * Initializes an underlying model and a database table.
   * Creates database table if it does not exist.
   */
  public constructor(initOptions: InitOptions) {
    super();

    RequestModel.init(
      {
        requestHash: {
          type: DataTypes.STRING,
          primaryKey: true,
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
          type: DataTypes.BIGINT,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        beneficiary: {
          type: DataTypes.STRING,
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
        gateway: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        sender: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        senderProxy: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        ...initOptions,
        modelName: 'Request',
        tableName: 'requests',
      },
    );

    // RequestModel.belongsTo(MessageModel, { foreignKey: 'messageHash' });
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
  public async save(request: Request): Promise<Request> {
    const definedOwnProps: string[] = Utils.getDefinedOwnProps(request);
    await RequestModel.upsert(
      request,
      {
        fields: definedOwnProps,
      },
    );
    const requestOutput = await this.get(request.requestHash);
    assert(
      requestOutput !== null,
      `Updated request not found for requestHash: ${request.requestHash}`,
    );

    this.newUpdate(requestOutput as Request);

    return requestOutput as Request;
  }

  /**
   * Returns a stake/redeem request with the specified stake/redeem request's hash or
   * null if there is no.
   *
   * @param requestHash Request's hash to retrieve.
   *
   * @return Request object if exists, otherwise null.
   */
  public async get(requestHash: string): Promise<Request | null> {
    const requestModel = await RequestModel.findOne({
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
   * @return Request object if exists, otherwise null.
   */
  public async getByMessageHash(messageHash: string): Promise<Request | null> {
    const requestModel = await RequestModel.findOne({
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
  public async getWithNullMessageHash(): Promise<Request[]> {
    const requestModels: RequestModel[] = await RequestModel.findAll({
      where: {
        messageHash: null,
      },
    });

    return this.convertToRequests(requestModels);
  }


  /* Private Functions */

  private convertToRequest(requestModel: RequestModel): Request {
    const request = new Request(
      requestModel.requestHash,
      new BigNumber(requestModel.blockNumber),
    );

    request.messageHash = requestModel.messageHash;
    request.amount = new BigNumber(requestModel.amount);
    request.beneficiary = requestModel.beneficiary;
    request.gasPrice = new BigNumber(requestModel.gasPrice);
    request.gasLimit = new BigNumber(requestModel.gasLimit);
    request.nonce = new BigNumber(requestModel.nonce);
    request.gateway = requestModel.gateway;
    request.sender = requestModel.sender;
    request.senderProxy = requestModel.senderProxy;
    request.createdAt = requestModel.createdAt;
    request.updatedAt = requestModel.updatedAt;

    return request;
  }

  private convertToRequests(requestModels: RequestModel[]): Request[] {
    const requests: Request[] = [];
    for (let i = 0; i < requestModels.length; i += 1) {
      requests.push(this.convertToRequest(requestModels[i]));
    }

    return requests;
  }
}
