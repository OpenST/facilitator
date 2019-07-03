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

export class ContractEntityModel extends Model {
}

/**
 * To be used for calling any methods which would change states of record(s) in Database.
 */
export interface ContractEntityAttributes {
  contractAddress: string;
  entityType: string;
  timestamp: BigNumber;
}

/**
 * Repository would always return database rows after typecasting to this.
 */
export interface ContractEntity extends ContractEntityAttributes {
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
  BountyChangeInitiated = 'bountychangeinititated',
  BountyChangeConfirmed = 'bountychangeconfirmed'
}

/**
 * Stores instances of ContractEntity.
 *
 * Class enables creation, update and retrieval of ContractEntity objects.
 * On construction it initializes underlying database model.
 */
export class ContractEntityRepository {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    ContractEntityModel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        contractAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
          unique: 'UK_contractaddress_entitytype',
        },
        entityType: {
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
          unique: 'UK_contractaddress_entitytype',
        },
        timestamp: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
      },
      {
        ...initOptions,
        modelName: 'ContractEntityModel',
        tableName: 'contract_entity',
      },
    );
  }

  /**
   * Creates a contract entity model in the repository and syncs with database.
   * @param contractEntityAttributes ContractEntityAttributes object.
   * @return ContractEntity object.
   */
  public async create(contractEntityAttributes: ContractEntityAttributes): Promise<ContractEntity> {
    try {
      const contractEntity: ContractEntity = await ContractEntityModel.create(
        contractEntityAttributes,
      ) as ContractEntity;
      this.format(contractEntity);
      return contractEntity;
    } catch (e) {
      const errorContext = {
        attributes: contractEntityAttributes,
        reason: e.message,
      };
      return Promise.reject(new Error(`Failed to create a ContractEntity: ${JSON.stringify(errorContext)}`));
    }
  }

  /**
   * Fetches ContractEntity data from database.
   * @param contractEntityAttribute ContractEntityAttributes object.
   * @returns ContractEntity object containing values which satisfy the `where` condition.
   */
  public async get(
    contractEntityAttribute: ContractEntityAttributes,
  ): Promise<ContractEntity | null> {
    const contractEntityModel = await ContractEntityModel.findOne({
      where: {
        contractAddress: {
          [Op.eq]: contractEntityAttribute.contractAddress,
        },
        entityType: {
          [Op.eq]: contractEntityAttribute.entityType,
        },
      },
    });

    if (contractEntityModel === null) {
      return null;
    }
    const contractEntity: ContractEntity = contractEntityModel;
    this.format(contractEntity);
    return contractEntity;
  }

  /**
   * Updates ContractEntity data in database.
   * @param contractEntityAttributes ContractEntityAttributes object.
   * @return Number of affected rows.
   */
  public async update(contractEntityAttribute: ContractEntityAttributes): Promise<number[]> {
    return ContractEntityModel.update(contractEntityAttribute, {
      where: {
        contractAddress: {
          [Op.eq]: contractEntityAttribute.contractAddress,
        },
        entityType: {
          [Op.eq]: contractEntityAttribute.entityType,
        },
      },
    });
  }

  /**
   * Modifies the contract entity object by typecasting required properties.
   * @param contractEntity ContractEntity object.
   */
  private format(contractEntity: ContractEntity): void {
    /* eslint-disable no-param-reassign */
    contractEntity.timestamp = new BigNumber(contractEntity.timestamp);
  }
}
