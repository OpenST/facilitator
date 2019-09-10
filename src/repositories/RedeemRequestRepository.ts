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

import RedeemRequest from '../models/RedeemRequest';
import Subject from '../observer/Subject';
import Utils from '../Utils';
import { MessageModel } from './MessageRepository';


/**
 * An interface, that represents a row from a redeem request table.
 *
 * See: http://docs.sequelizejs.com/manual/typescript.html#usage
 */
class RedeemRequestModel extends Model {
  public readonly redeemRequestHash!: string;

  public readonly messageHash!: string;

  public readonly amount!: BigNumber;

  public readonly beneficiary!: string;

  public readonly gasPrice!: BigNumber;

  public readonly gasLimit!: BigNumber;

  public readonly nonce!: BigNumber;

  public readonly cogateway!: string;

  public readonly redeemer!: string;

  public readonly redeemerProxy!: string;

  public readonly blockNumber!: BigNumber;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Stores instances of RedeemRequest.
 *
 * Class enables creation, update and retrieval of RedeemRequest objects.
 * On construction it initializes underlying database model.
 */
export default class RedeemRequestRepository extends Subject<RedeemRequest> {
  /* Public Functions */

  /**
   * Initializes an underlying model and a database table.
   * Creates database table if it does not exist.
   */
  public constructor(initOptions: InitOptions) {
    super();

    RedeemRequestModel.init(
      {
        redeemRequestHash: {
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
        cogateway: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        redeemer: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        redeemerProxy: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        ...initOptions,
        modelName: 'RedeemRequest',
        tableName: 'redeem_requests',
      },
    );

    RedeemRequestModel.belongsTo(MessageModel, { foreignKey: 'messageHash' });
  }

  /**
   * Saves a redeem request model in the repository.
   * If a redeem request does not exist, it creates, otherwise updates.
   *
   * Function ignores (does not set to null) undefined (optional) fields
   * from the passed redeem request object.
   *
   * @param redeemRequest Redeem request object to update.
   *
   * @returns Newly created or updated redeem request object (with all saved fields).
   */
  public async save(redeemRequest: RedeemRequest): Promise<RedeemRequest> {
    const definedOwnProps: string[] = Utils.getDefinedOwnProps(redeemRequest);
    await RedeemRequestModel.upsert(
      redeemRequest,
      {
        fields: definedOwnProps,
      },
    );
    const redeemRequestOutput = await this.get(redeemRequest.redeemRequestHash);
    assert(
      redeemRequestOutput !== null,
      `Updated redeemRequest not found for redeemRequestHash: ${redeemRequest.redeemRequestHash}`,
    );

    this.newUpdate(redeemRequestOutput as RedeemRequest);

    return redeemRequestOutput as RedeemRequest;
  }

  /**
   * Returns a redeem request with the specified redeem request's hash or
   * null if there is no.
   *
   * @param redeemRequestHash Redeem request's hash to retrieve.
   *
   * @return Redeem request object if exists, otherwise null.
   */
  public async get(redeemRequestHash: string): Promise<RedeemRequest | null> {
    const redeemRequestModel = await RedeemRequestModel.findOne({
      where: {
        redeemRequestHash,
      },
    });

    if (redeemRequestModel === null) {
      return null;
    }

    return this.convertToRedeemRequest(redeemRequestModel);
  }

  /**
   * Returns a redeem request with the specified message hash or
   * null if there is no.
   *
   * @param messageHash Message hash to be used for retrieval.
   *
   * @return Redeem request object if exists, otherwise null.
   */
  public async getByMessageHash(messageHash: string): Promise<RedeemRequest | null> {
    const redeemRequestModel = await RedeemRequestModel.findOne({
      where: {
        messageHash,
      },
    });

    if (redeemRequestModel === null) {
      return null;
    }

    return this.convertToRedeemRequest(redeemRequestModel);
  }

  /**
   * Gets all redeem requests with a null message hash.
   */
  public async getWithNullMessageHash(): Promise<RedeemRequest[]> {
    const redeemRequestModels: RedeemRequestModel[] = await RedeemRequestModel.findAll({
      where: {
        messageHash: null,
      },
    });

    return this.convertToRedeemRequests(redeemRequestModels);
  }


  /* Private Functions */

  private convertToRedeemRequest(redeemRequestModel: RedeemRequestModel): RedeemRequest {
    const redeemRequest = new RedeemRequest(
      redeemRequestModel.redeemRequestHash,
      new BigNumber(redeemRequestModel.blockNumber),
    );

    redeemRequest.messageHash = redeemRequestModel.messageHash;
    redeemRequest.amount = new BigNumber(redeemRequestModel.amount);
    redeemRequest.beneficiary = redeemRequestModel.beneficiary;
    redeemRequest.gasPrice = new BigNumber(redeemRequestModel.gasPrice);
    redeemRequest.gasLimit = new BigNumber(redeemRequestModel.gasLimit);
    redeemRequest.nonce = new BigNumber(redeemRequestModel.nonce);
    redeemRequest.cogateway = redeemRequestModel.cogateway;
    redeemRequest.redeemer = redeemRequestModel.redeemer;
    redeemRequest.redeemerProxy = redeemRequestModel.redeemerProxy;
    redeemRequest.createdAt = redeemRequestModel.createdAt;
    redeemRequest.updatedAt = redeemRequestModel.updatedAt;

    return redeemRequest;
  }

  private convertToRedeemRequests(redeemRequestModels: RedeemRequestModel[]): RedeemRequest[] {
    const redeemRequests: RedeemRequest[] = [];
    for (let i = 0; i < redeemRequestModels.length; i += 1) {
      redeemRequests.push(this.convertToRedeemRequest(redeemRequestModels[i]));
    }

    return redeemRequests;
  }
}
