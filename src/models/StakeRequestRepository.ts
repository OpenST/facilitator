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
  DataTypes, Model, InitOptions,
} from 'sequelize';
import BigNumber from 'bignumber.js';

import {
  MessageModel,
  Message,
} from './MessageRepository';

class StakeRequestModel extends Model {}

/**
 * An interface for input to create a StakeRequest object in the StakeRequestRepository.
 *
 * @see StakeRequestRepository::create()
 */
export interface StakeRequestAttributes {
  stakeRequestHash: string;
  messageHash?: string;
  amount: BigNumber;
  beneficiary: string;
  gasPrice: BigNumber;
  gasLimit: BigNumber;
  nonce: BigNumber;
  gateway: string;
  stakerProxy: string;
}

/**
 * An interface for an object created and stored within StakeRequestRepository.
 *
 * @see StakeRequestRepository::create()
 * @see StakeRequestRepository::get()
 */
export interface StakeRequest extends StakeRequestAttributes {
  message: Message;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stores instances of StakeRequest.
 *
 * Class enables creation, update and retrieval of StakeRequest objects.
 * On construction it initializes underlying database model.
 */
export class StakeRequestRepository {
  /* Public Functions */

  /**
   * Initializes an underlying model and a database table.
   * Creates database table if it does not exist.
   */
  public constructor(initOptions: InitOptions) {
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
        stakerProxy: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        ...initOptions,
        modelName: 'stakeRequest',
        tableName: 'stake_request',
      },
    );
    StakeRequestModel.belongsTo(MessageModel, { foreignKey: 'messageHash' });
  }

  /**
   * Creates a stake request model in the repository.
   *
   * Function throws if a stake request with the same stake request's hash
   * already exists.
   *
   * @param stakeRequestAttributes Attributes of a newly created stake request.
   *
   * @return Newly created stake request object.
   */
  public async create(stakeRequestAttributes: StakeRequestAttributes): Promise<StakeRequest> {
    try {
      const stakeRequest: StakeRequest = await StakeRequestModel.create(stakeRequestAttributes);
      this.format(stakeRequest);
      return stakeRequest;
    } catch (e) {
      const errorContext = {
        input: {
          stakeRequestAttributes,
        },
        reason: e.message,
      };

      throw Error(`Failed to create a stake request: ${JSON.stringify(errorContext)}`);
    }
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
      include: [
        MessageModel,
      ],
    });

    if (stakeRequestModel === null) {
      return null;
    }
    const stakeRequest: StakeRequest = stakeRequestModel;
    this.format(stakeRequest);
    return stakeRequest;
  }

  /**
   * Updates a message hash for the specified stake request's hash.
   *
   * Function fails if stake request's hash does not exist.
   *
   * @param stakeRequestHash Stake request's hash to update message hash.
   * @param messageHash New message hash to update.
   */
  public async updateMessageHash(stakeRequestHash: string, messageHash: string): Promise<void> {
    const stakeRequestModel: StakeRequestModel = await StakeRequestModel.findOne({
      where: {
        stakeRequestHash,
      },
    });

    if (stakeRequestModel === null) {
      const errorContext = {
        input: {
          stakeRequestHash,
          messageHash,
        },
        reason: 'The specified stake request hash does not exist.',
      };
      throw new Error(`Failed to update a stake request: ${JSON.stringify(errorContext)}`);
    }

    try {
      await stakeRequestModel.update({ messageHash });
    } catch (e) {
      const errorContext = {
        input: {
          stakeRequestHash,
          messageHash,
        },
        reason: e.message,
      };

      throw Error(`Failed to update a stake request: ${JSON.stringify(errorContext)}`);
    }
  }

  /**
   * Modifies the message object by typecasting required properties.
   * @param {StakeRequest} stakeRequest
   */
  private format(stakeRequest: StakeRequest): void {
    stakeRequest.amount = new BigNumber(stakeRequest.amount);
    stakeRequest.nonce = new BigNumber(stakeRequest.nonce);
    stakeRequest.gasLimit = new BigNumber(stakeRequest.gasLimit);
    stakeRequest.gasPrice = new BigNumber(stakeRequest.gasPrice);
  }
}
