// Copyright 2020 OpenST Ltd.
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
import { DataTypes, InitOptions, Model } from 'sequelize';

import { MAX_VALUE } from '../../m0_facilitator/Constants';
import DepositIntent from '../models/DepositIntent';
import Subject from '../../common/observer/Subject';
import Utils from '../../common/Utils';

/**
 * An interface, that represents a row from a deposit_intents table.
 */
class DepositIntentModel extends Model {
  public readonly intentHash!: string;

  public readonly messageHash!: string;

  public readonly tokenAddress!: string;

  public readonly amount!: BigNumber;

  public readonly beneficiary!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Stores instances of DepositIntent.
 *
 * Class enables creation, updation and retrieval of DepositIntent objects.
 * On construction it initializes underlying database model.
 */
export default class DepositIntentRepository extends Subject<DepositIntent> {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    super();

    DepositIntentModel.init(
      {
        messageHash: {
          type: DataTypes.STRING,
          primaryKey: true,
          validate: {
            isAlphanumeric: true,
          },
        },
        intentHash: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isAlphanumeric: true,
          },
        },
        tokenAddress: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        amount: {
          type: DataTypes.DECIMAL(78),
          allowNull: true,
          validate: {
            min: 0,
            max: MAX_VALUE,
          },
        },
        beneficiary: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
      },
      {
        ...initOptions,
        modelName: 'DepositIntent',
        tableName: 'deposit_intents',
      },
    );
  }

  /**
   * Saves a DepositIntent model in the repository.
   * If a DepositIntent does not exist, it creates else it updates.
   *
   * @param depositIntent DepositIntent object to update.
   *
   * @returns Newly created or updated DepositIntent object.
   */
  public async save(depositIntent: DepositIntent): Promise<DepositIntent> {
    const depositIntentModelObj = await DepositIntentModel.findOne(
      {
        where: {
          messageHash: depositIntent.messageHash,
        },
      },
    );

    let updatedDepositIntent: DepositIntent|null;
    if (depositIntentModelObj === null) {
      updatedDepositIntent = this.convertToDepositIntent(await DepositIntentModel.create(
        depositIntent,
      ));
    } else {
      const definedOwnProps: string[] = Utils.getDefinedOwnProps(depositIntent);
      await DepositIntentModel.update(
        depositIntent,
        {
          where: {
            messageHash: depositIntent.messageHash,
          },
          fields: definedOwnProps,
        },
      );
      updatedDepositIntent = await this.get(
        depositIntent.messageHash,
      );
    }

    assert(
      updatedDepositIntent !== null,
      `Updated DepositIntent record not found for message hash: ${depositIntent.messageHash}`,
    );

    this.newUpdate(updatedDepositIntent as DepositIntent);

    return updatedDepositIntent as DepositIntent;
  }

  /**
   * Fetches DepositIntent object from database if found. Otherwise returns null.
   *
   * @param messageHash Message hash.
   *
   * @returns DepositIntent object containing values which satisfy the `where` condition.
   */
  public async get(messageHash: string): Promise<DepositIntent | null> {
    const depositIntentModel = await DepositIntentModel.findOne({
      where: {
        messageHash,
      },
    });

    if (depositIntentModel === null) {
      return null;
    }

    return this.convertToDepositIntent(depositIntentModel);
  }

  /* Private Functions */

  /**
   * It converts DepositIntent db object to DepositIntent model object.
   *
   * @param depositIntentModel DepositIntentModel object to convert.
   *
   * @returns DepositIntent object.
   */
  /* eslint-disable class-methods-use-this */
  private convertToDepositIntent(depositIntentModel: DepositIntentModel): DepositIntent {
    return new DepositIntent(
      depositIntentModel.messageHash,
      depositIntentModel.tokenAddress,
      depositIntentModel.amount ? new BigNumber(
        depositIntentModel.amount,
      ) : depositIntentModel.amount,
      depositIntentModel.beneficiary,
      depositIntentModel.intentHash,
      depositIntentModel.createdAt,
      depositIntentModel.updatedAt,
    );
  }
}
