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
import Subject from '../../common/observer/Subject';
import Utils from '../../common/Utils';
import WithdrawIntent from '../models/WithdrawIntent';

/**
 * An interface, that represents a row from a withdraw_intents table.
 */
class WithdrawIntentModel extends Model {
  public readonly intentHash!: string;

  public readonly messageHash!: string;

  public readonly tokenAddress!: string;

  public readonly amount!: BigNumber;

  public readonly beneficiary!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Stores instances of WithdrawIntent.
 *
 * Class enables creation, updation and retrieval of WithdrawIntent objects.
 * On construction it initializes underlying database model.
 */
export default class WithdrawIntentRepository extends Subject<WithdrawIntent> {
  /* Public Functions */
  public constructor(initOptions: InitOptions) {
    super();

    WithdrawIntentModel.init(
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
        modelName: 'WithdrawIntent',
        tableName: 'withdraw_intents',
      },
    );
  }

  /**
   * Saves a WithdrawIntent model in the repository.
   * If a WithdrawIntent does not exist, it creates else it updates.
   *
   * @param withdrawIntent WithdrawIntent object to update.
   *
   * @returns Newly created or updated withdrawIntent object.
   */
  public async save(withdrawIntent: WithdrawIntent): Promise<WithdrawIntent> {
    const withdrawIntentModelObj = await WithdrawIntentModel.findOne(
      {
        where: {
          messageHash: withdrawIntent.messageHash,
        },
      },
    );

    let updatedWithdrawIntent: WithdrawIntent | null;
    if (withdrawIntentModelObj === null) {
      updatedWithdrawIntent = this.convertToWithdrawIntent(await WithdrawIntentModel.create(
        withdrawIntent,
      ));
    } else {
      const definedOwnProps: string[] = Utils.getDefinedOwnProps(withdrawIntent);
      await WithdrawIntentModel.update(
        withdrawIntent,
        {
          where: {
            messageHash: withdrawIntent.messageHash,
          },
          fields: definedOwnProps,
        },
      );
      updatedWithdrawIntent = await this.get(
        withdrawIntent.messageHash,
      );
    }

    assert(
      updatedWithdrawIntent !== null,
      `Updated WithdrawIntent record not found for message hash: ${withdrawIntent.messageHash}`,
    );

    this.newUpdate(updatedWithdrawIntent as WithdrawIntent);

    return updatedWithdrawIntent as WithdrawIntent;
  }

  /**
   * Fetches WithdrawIntent object from database if found. Otherwise returns null.
   *
   * @param messageHash Withdraw message hash.
   *
   * @returns WithdrawIntent object containing values which satisfy the `where` condition.
   */
  public async get(messageHash: string): Promise<WithdrawIntent | null> {
    const withdrawIntentModel = await WithdrawIntentModel.findOne({
      where: {
        messageHash,
      },
    });

    if (withdrawIntentModel === null) {
      return null;
    }

    return this.convertToWithdrawIntent(withdrawIntentModel);
  }


  /* Private Functions */

  /**
   * It converts WithdrawIntent db object to WithdrawIntent model object.
   *
   * @param withdrawIntentModel WithdrawIntentModel object to convert.
   *
   * @returns WithdrawIntent object.
   */
  /* eslint-disable class-methods-use-this */
  private convertToWithdrawIntent(withdrawIntentModel: WithdrawIntentModel): WithdrawIntent {
    return new WithdrawIntent(
      withdrawIntentModel.messageHash,
      withdrawIntentModel.tokenAddress,
      withdrawIntentModel.amount ? new BigNumber(
        withdrawIntentModel.amount,
      ) : withdrawIntentModel.amount,
      withdrawIntentModel.beneficiary,
      withdrawIntentModel.intentHash,
      withdrawIntentModel.createdAt,
      withdrawIntentModel.updatedAt,
    );
  }
}
