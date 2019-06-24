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

class AuxiliaryChainModel extends Model {}

/**
 * To be used for calling any methods which would change states of record(s) in Database.
 */
export interface AuxiliaryChainAttributes {
  chainId: number;
  originChainName: string;
  ostGatewayAddress: string;
  ostCoGatewayAddress: string;
  anchorAddress: string;
  coAnchorAddress: string;
  lastProcessedBlockNumber?: number;
  lastOriginBlockHeight?: number;
  lastAuxiliaryBlockHeight?: number;
}

/**
 * Repository would always return database rows after typecasting to this
 */
export interface AuxiliaryChain extends AuxiliaryChainAttributes{
  createdAt: Date;
  updatedAt: Date;
}

export class AuxiliaryChainRepository {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    AuxiliaryChainModel.init(
      {
        chainId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        originChainName: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [3, 50],
          },
        },
        ostGatewayAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        ostCoGatewayAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        anchorAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        coAnchorAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        lastProcessedBlockNumber: {
          type: DataTypes.BIGINT,
          allowNull: true,
          defaultValue: null,
          validate: {
            min: 0,
          },
        },
        lastOriginBlockHeight: {
          type: DataTypes.BIGINT,
          allowNull: true,
          defaultValue: null,
          validate: {
            min: 0,
          },
        },
        lastAuxiliaryBlockHeight: {
          type: DataTypes.BIGINT,
          allowNull: true,
          defaultValue: null,
          validate: {
            min: 0,
          },
        },
      },
      {
        ...initOptions,
        modelName: 'auxiliaryChain',
        tableName: 'auxiliary_chain',
      },
    );
  }

  /**
   * Creates an auxiliary chain model in the repository and syncs with database.
   * @param {AuxiliaryChainAttributes} auxiliaryChainAttributes
   * @return {Promise<AuxiliaryChain>}
   */
  public async create(auxiliaryChainAttributes: AuxiliaryChainAttributes): Promise<AuxiliaryChain> {
    try {
      return await AuxiliaryChainModel.create(auxiliaryChainAttributes) as AuxiliaryChain;
    } catch (e) {
      const errorContext = {
        attributes: auxiliaryChainAttributes,
        reason: e.message,
      };
      return Promise.reject(`Failed to create an auxiliary chain: ${JSON.stringify(errorContext)}`);
    }
  }

  /**
   * Fetches auxiliary chain data from database.
   * @param {number} chainId
   * @return {Promise<AuxiliaryChain | null>}
   */
  public async get(chainId: number): Promise<AuxiliaryChain | null> {
    const auxiliaryChain = await AuxiliaryChainModel.findOne({
      where: {
        chainId,
      },
    });

    if (auxiliaryChain === null) {
      return null;
    }

    return auxiliaryChain as AuxiliaryChain;
  }

  /**
   * Updates auxiliary chain data in database and does not return the updated state.
   * @param {AuxiliaryChainAttributes} auxiliaryChainAttributes
   * @return {Promise<number[]>>}
   */
  public async update(auxiliaryChainAttributes: AuxiliaryChainAttributes): Promise<number[]> {
    return await AuxiliaryChainModel.update(auxiliaryChainAttributes, {
      where: {
        chainId: {
          [Op.eq]: auxiliaryChainAttributes.chainId,
        },
      },
    });
  }
}
