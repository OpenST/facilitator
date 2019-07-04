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
import ContractEntity from '../models/ContractEntity';

export class ContractEntityModel extends Model {
  public readonly contractAddress?: string;

  public readonly entityType?: string;

  public readonly timestamp?: BigNumber;

  public readonly createdAt?: Date;

  public readonly updatedAt?: Date;
}

/**
 * Entity types of origin and aux chain for which timestamp will be recorded.
 */
export enum EntityType {
  StateRootAvailable = 'staterootavailable',
  StakeIntentConfirmed = 'stateintentconfirmed',
  MintProgressed = 'mintprogressed',
  GatewayProven = 'gatewayproven',
  StakeRequested = 'stakerequested',
  StakeIntentDeclared = 'stakeintentdeclared',
  StakeProgressed = 'stakeprogressed',
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
        contractAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
          primaryKey: true,
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
            ],
          }),
          primaryKey: true,
        },
        timestamp: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
      },
      {
        ...initOptions,
        modelName: 'ContractEntityModel',
        tableName: 'contract_entities',
      },
    );
  }

  /**
   * Creates a contract entity model in the repository and syncs with database.
   * @param contractEntity ContractEntity object to be created.
   * @return ContractEntity object.
   */
  public async create(contractEntity: ContractEntity): Promise<ContractEntity> {
    try {
      const entity: ContractEntity = await ContractEntityModel.create(
        contractEntity,
      );

      return this.format(entity);
    } catch (e) {
      const errorContext = {
        attributes: contractEntity,
        reason: e.message,
      };
      return Promise.reject(new Error(`Failed to create a ContractEntity: ${JSON.stringify(errorContext)}`));
    }
  }

  /**
   * Fetches ContractEntity data from database.
   * @param contractAddress Address of the contract.
   * @param entityType Type of the entity.
   * @returns ContractEntity object containing values which satisfy the `where` condition.
   */
  public async get(
    contractAddress: string,
    entityType: string,
  ): Promise<ContractEntity | null> {
    const contractEntityModel = await ContractEntityModel.findOne({
      where: {
        contractAddress: {
          [Op.eq]: contractAddress,
        },
        entityType: {
          [Op.eq]: entityType,
        },
      },
    });

    if (contractEntityModel === null) {
      return null;
    }
    const contractEntity: ContractEntity = contractEntityModel;

    return this.format(contractEntity);
  }

  /**
   * Updates ContractEntity data in database.
   * @param contractEntity ContractEntity object.
   * @return Number of affected rows.
   */
  public async update(contractEntity: ContractEntity): Promise<number[]> {
    return ContractEntityModel.update(contractEntity, {
      where: {
        contractAddress: {
          [Op.eq]: contractEntity.contractAddress,
        },
        entityType: {
          [Op.eq]: contractEntity.entityType,
        },
      },
    });
  }

  /**
   * Modifies the contract entity object by typecasting required properties.
   * @param contractEntity ContractEntity object.
   */
  private format(contractEntity: ContractEntity): ContractEntity {
    const formattedContractEntity: ContractEntity = contractEntity;
    if (contractEntity.timestamp) {
      formattedContractEntity.timestamp = new BigNumber(contractEntity.timestamp);
    }
    return formattedContractEntity;
  }
}
