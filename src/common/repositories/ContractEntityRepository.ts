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


import assert from 'assert';
import BigNumber from 'bignumber.js';
import {
  DataTypes, InitOptions, Model, Op,
} from 'sequelize';

import ContractEntity, { M0EntityType, M1EntityType } from '../models/ContractEntity';
import Subject from '../observer/Subject';
import Utils from '../Utils';

/**
 * An interface, that represents a row from a contract entities table.
 */
class ContractEntityModel<T> extends Model<T> {
  public readonly contractAddress!: string;

  public readonly entityType!: T;

  public readonly timestamp!: BigNumber;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Stores instances of ContractEntity.
 *
 * Class enables creation, update and retrieval of ContractEntity objects.
 * On construction it initializes underlying database model.
 */
export default class ContractEntityRepository<T> extends Subject<ContractEntity<T>> {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    super();
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
          primaryKey: true,
          type: DataTypes.ENUM({
            values: [
              // Common entities for M0 and M1 facilitator
              M0EntityType.GatewayProvens,
              M0EntityType.StateRootAvailables,
              // M0 facilitator entities
              // Stake & Mint Entities
              M0EntityType.StakeRequesteds,
              M0EntityType.StakeIntentDeclareds,
              M0EntityType.StakeIntentConfirmeds,
              M0EntityType.StakeProgresseds,
              M0EntityType.MintProgresseds,
              // Redeem & Unstake entities
              M0EntityType.RedeemRequesteds,
              M0EntityType.RedeemIntentDeclareds,
              M0EntityType.RedeemIntentConfirmeds,
              M0EntityType.RedeemProgresseds,
              M0EntityType.UnstakeProgresseds,
              // M1 facilitator entities
              // Deposit and confirm deposit entities
              M1EntityType.DeclaredDepositIntents,
              M1EntityType.ConfirmedDepositIntents,
              // Withdraw and Confirm withdraw entities
              M1EntityType.DeclaredWithdrawIntents,
              M1EntityType.ConfirmedWithdrawIntents,
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
        modelName: 'ContractEntity',
        tableName: 'contract_entities',
      },
    );
  }

  /**
   * Saves a contract entity model in the repository.
   * If a contract entity does not exist, it creates, otherwise updates.
   *
   * Function ignores (does not set to null) undefined (optional) fields
   * from the passed contract entity object.
   *
   * @param contractEntity Contract entity object to update.
   *
   * @returns Newly created or updated contract entity object.
   */
  public async save(contractEntity: ContractEntity<T>): Promise<ContractEntity<T>> {
    const contractEntityModelObj = await ContractEntityModel.findOne(
      {
        where: {
          contractAddress: contractEntity.contractAddress,
          entityType: contractEntity.entityType,
        },
      },
    );

    let updatedContractEntity: ContractEntity<T> | null;
    if (contractEntityModelObj === null) {
      updatedContractEntity = this.convertToContractEntity(
        await ContractEntityModel.create<ContractEntityModel<T>>(
          contractEntity,
        ),
      );
    } else {
      const definedOwnProps: string[] = Utils.getDefinedOwnProps(contractEntity);
      await ContractEntityModel.update(
        contractEntity,
        {
          where: {
            contractAddress: contractEntity.contractAddress,
            entityType: contractEntity.entityType,
          },
          fields: definedOwnProps,
        },
      );
      updatedContractEntity = await this.get(
        contractEntity.contractAddress,
        contractEntity.entityType as unknown as string,
      );
    }

    assert(
      updatedContractEntity !== null,
      'Updated contract entity record not found for contractAddress:'
       + ` ${contractEntity.contractAddress} and entityType: ${contractEntity.entityType}`,
    );

    this.newUpdate(updatedContractEntity as ContractEntity<T>);

    return updatedContractEntity as ContractEntity<T>;
  }

  /**
   * Fetches ContractEntity data from database if found. Otherwise returns null.
   * @param contractAddress Address of the contract.
   * @param entityType Type of the entity.
   * @returns ContractEntity object containing values which satisfy the `where` condition.
   */
  public async get(
    contractAddress: string,
    entityType: string,
  ): Promise<ContractEntity<T> | null> {
    const contractEntityModel = await ContractEntityModel.findOne<ContractEntityModel<T>>({
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

    return this.convertToContractEntity(contractEntityModel);
  }


  /* Private Functions */

  /**
   * It converts contract entity model object to contract entity object.
   * @param contractEntityModel Contract entity model object to convert.
   * @returns Contract Entity object.
   */
  /* eslint-disable class-methods-use-this */
  private convertToContractEntity(contractEntityModel: ContractEntityModel<T>): ContractEntity<T> {
    const contractEntity = new ContractEntity<T>(
      contractEntityModel.contractAddress,
      contractEntityModel.entityType,
      new BigNumber(contractEntityModel.timestamp),
      contractEntityModel.createdAt,
      contractEntityModel.updatedAt,
    );

    return contractEntity;
  }
}
