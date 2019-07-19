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

import { DataTypes, Model, InitOptions } from 'sequelize';
import BigNumber from 'bignumber.js';
import { MessageModel } from './MessageRepository';
import Subject from '../observer/Subject';
import StakeRequest from '../models/StakeRequest';
import Utils from '../Utils';

import assert = require('assert');
import Logger from "../Logger";


/**
 * An interface, that represents a row from a stake request table.
 *
 * See: http://docs.sequelizejs.com/manual/typescript.html#usage
 */
class StakeRequestModel extends Model {
  public readonly stakeRequestHash!: string;

  public readonly messageHash!: string;

  public readonly amount!: BigNumber;

  public readonly beneficiary!: string;

  public readonly gasPrice!: BigNumber;

  public readonly gasLimit!: BigNumber;

  public readonly nonce!: BigNumber;

  public readonly gateway!: string;

  public readonly staker!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Stores instances of StakeRequest.
 *
 * Class enables creation, update and retrieval of StakeRequest objects.
 * On construction it initializes underlying database model.
 */
export default class StakeRequestRepository extends Subject<StakeRequest> {
  /* Public Functions */

  /**
   * Initializes an underlying model and a database table.
   * Creates database table if it does not exist.
   */
  public constructor(initOptions: InitOptions) {
    super();

    StakeRequestModel.init(
      {
        stakeRequestHash: {
          type: DataTypes.STRING,
          primaryKey: true,
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
        staker: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        ...initOptions,
        modelName: 'StakeRequest',
        tableName: 'stake_requests',
      },
    );

    StakeRequestModel.belongsTo(MessageModel, { foreignKey: 'messageHash' });
  }

  /**
   * Saves a stake request model in the repository.
   * If a stake request does not exist, it creates, otherwise updates.
   *
   * Function ignores (does not set to null) undefined (optional) fields
   * from the passed stake request object.
   *
   * @param stakeRequest Stake request object to update.
   *
   * @returns Newly created or updated stake request object (with all saved fields).
   */
  public async save(stakeRequest: StakeRequest): Promise<StakeRequest> {
    const definedOwnProps: string[] = Utils.getDefinedOwnProps(stakeRequest);
    const result = await StakeRequestModel.upsert(
      stakeRequest,
      {
        fields: definedOwnProps,
      },
    );
    Logger.debug(`Upsert result: ${result}`);
    const stakeRequestOutput = await this.get(stakeRequest.stakeRequestHash);
    assert(stakeRequestOutput !== null);

    this.newUpdate(stakeRequestOutput as StakeRequest);

    return stakeRequestOutput as StakeRequest;
  }

  /**
   * Returns a stake request with the specified stake request's hash or
   * null if there is no.
   *
   * @param stakeRequestHash Stake request's hash to retrieve.
   *
   * @return Stake request object if exists, otherwise null.
   */
  public async get(stakeRequestHash: string): Promise<StakeRequest | null> {
    const stakeRequestModel = await StakeRequestModel.findOne({
      where: {
        stakeRequestHash,
      },
    });

    if (stakeRequestModel === null) {
      return null;
    }

    return this.convertToStakeRequest(stakeRequestModel);
  }

  /**
   * Returns a stake request with the specified message hash or
   * null if there is no.
   *
   * @param messageHash Message hash to be used for retrieval.
   *
   * @return Stake request object if exists, otherwise null.
   */
  public async getByMessageHash(messageHash: string): Promise<StakeRequest | null> {
    const stakeRequestModel = await StakeRequestModel.findOne({
      where: {
        messageHash,
      },
    });

    if (stakeRequestModel === null) {
      return null;
    }

    return this.convertToStakeRequest(stakeRequestModel);
  }

  /**
   * Gets all stake requests with a null message hash.
   */
  public async getWithNullMessageHash(): Promise<StakeRequest[]> {
    const stakeRequestModels: StakeRequestModel[] = await StakeRequestModel.findAll({
      where: {
        messageHash: null,
      },
    });

    return this.convertToStakeRequests(stakeRequestModels);
  }


  /* Private Functions */

  private convertToStakeRequest(stakeRequestModel: StakeRequestModel): StakeRequest {
    const stakeRequest = new StakeRequest(
      stakeRequestModel.stakeRequestHash,
    );

    stakeRequest.messageHash = stakeRequestModel.messageHash;
    stakeRequest.amount = new BigNumber(stakeRequestModel.amount);
    stakeRequest.beneficiary = stakeRequestModel.beneficiary;
    stakeRequest.gasPrice = new BigNumber(stakeRequestModel.gasPrice);
    stakeRequest.gasLimit = new BigNumber(stakeRequestModel.gasLimit);
    stakeRequest.nonce = new BigNumber(stakeRequestModel.nonce);
    stakeRequest.gateway = stakeRequestModel.gateway;
    stakeRequest.staker = stakeRequestModel.staker;
    stakeRequest.createdAt = stakeRequestModel.createdAt;
    stakeRequest.updatedAt = stakeRequestModel.updatedAt;

    return stakeRequest;
  }

  private convertToStakeRequests(stakeRequestModels: StakeRequestModel[]): StakeRequest[] {
    const stakeRequests: StakeRequest[] = [];
    for (let i = 0; i < stakeRequestModels.length; i += 1) {
      stakeRequests.push(this.convertToStakeRequest(stakeRequestModels[i]));
    }

    return stakeRequests;
  }
}
