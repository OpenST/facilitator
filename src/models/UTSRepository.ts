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

export class UTSModel extends Model {}

/**
 * To be used for calling any methods which would change states of record(s) in Database.
 */
export interface UTSAttributes {
  entityname: string;
  timestamp: BigNumber;
}

/**
 * Repository would always return database rows after typecasting to this.
 */
export interface UTS extends UTSAttributes{
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity types of origin and aux chain for which timestamp will be recorded.
 */
export enum EntityType {
  StakeRequested = 'stakerequested',
  StakeIntentDeclared = 'stakeintentdeclared',
  StateRootAvailable = 'staterootavailable',
  StakeIntentConfirmed = 'stateintentconfirmed',
  StakeProgressed = 'stakeprogressed',
  MintProgressed = 'mintprogressed',
  GatewayProven = 'gatewayproven',
  BountyChangeInitiated = 'BountyChangeInitiated',
  BountyChangeConfirmed = 'BountyChangeConfirmed'
}

/**
 * Stores instances of UTS.
 *
 * Class enables creation, update and retrieval of UTS objects.
 * On construction it initializes underlying database model.
 */
export class UTSRepository {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    UTSModel.init(
      {
        entityname: {
          type: DataTypes.ENUM({
            values: [
              EntityType.StakeIntentDeclared,
              EntityType.StakeRequested,
              EntityType.StateRootAvailable,
              EntityType.StakeIntentConfirmed,
              EntityType.StakeProgressed,
              EntityType.MintProgressed,
              EntityType.GatewayProven,
              EntityType.BountyChangeInitiated,
              EntityType.BountyChangeConfirmed,
            ],
          }),
        },
        timestamp: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
      },
      {
        ...initOptions,
        modelName: 'uts',
        tableName: 'uts',
      },
    );
  }

  /**
   * Creates a uts model in the repository and syncs with database.
   * @param {UTSAttributes} utsAttributes
   * @return {Promise<UTS>}
   */
  public async create(utsAttributes: UTSAttributes): Promise<UTS> {
    try {
      const uts: UTS = await UTSModel.create(utsAttributes) as UTS;
      this.format(uts);
      return uts;
    } catch (e) {
      const errorContext = {
        attributes: utsAttributes,
        reason: e.message,
      };
      return Promise.reject(new Error(`Failed to create a uts: ${JSON.stringify(errorContext)}`));
    }
  }

  /**
   * Fetches uts data from database.
   * @param {number} timestamp
   * @return {Promise<UTS | null>}
   */
  public async get(timestamp: number): Promise<UTS | null> {
    const utsModel = await UTSModel.findAndCountAll({
      where: {
        timestamp: {
          [Op.gte]: timestamp,
        },
      },
    });

    if (utsModel === null) {
      return null;
    }
    const uts: UTS = utsModel;
    this.format(uts);
    return uts;
  }

  /**
   * Updates uts data in database.
   * @param {UTSAttributes} utsAttributes
   * @return {Promise<Array<Number>>}
   */
  public async update(utsAttributes: UTSAttributes): Promise<number[]> {
    return UTSModel.update(utsAttributes, {
      where: {
        entityname: {
          [Op.eq]: utsAttributes.entityname,
        },
      },
    });
  }

  /**
   * Modifies the uts object by typecasting required properties.
   * @param {UTS} uts
   */
  private format(uts: UTS): void {
    uts.timestamp = new BigNumber(uts.timestamp);
  }
}
