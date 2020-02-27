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

import { DataTypes, Model, InitOptions } from 'sequelize';

import ERC20GatewayTokenPair from '../models/ERC20GatewayTokenPair';
import Subject from '../../common/observer/Subject';
import Utils from '../../common/Utils';

import assert = require('assert');

/* eslint-disable class-methods-use-this */

/**
 * An interface, that represents an ERC20GatewayTokenPair database model.
 *
 * See: http://docs.sequelizejs.com/manual/typescript.html#usage
 */
class ERC20GatewayTokenPairModel extends Model {
  public readonly gatewayGA!: string;

  public readonly valueToken!: string;

  public readonly utilityToken!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Stores instances of ERC20GatewayTokenPair models.
 *
 * Class enables creation, update and retrieval of ERC20GatewayTokenPair models.
 * On construction it initializes underlying database model.
 */
export default class ERC20GatewayTokenPairRepository extends Subject<ERC20GatewayTokenPair> {
  /* Public Functions */

  /**
   * Initializes an underlying database model and a database table.
   * Creates database table if it does not exist.
   */
  public constructor(initOptions: InitOptions) {
    super();

    ERC20GatewayTokenPairModel.init(
      {
        gatewayGA: {
          type: DataTypes.STRING,
          primaryKey: true,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        valueToken: {
          type: DataTypes.STRING,
          primaryKey: true,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        utilityToken: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
      },
      {
        ...initOptions,
        modelName: 'ERC20GatewayTokenPair',
        tableName: 'erc20gateway_token_pairs',
      },
    );
  }

  /**
   * Saves an erc20GatewayTokenPair model in the repository.
   *
   * If the given model does not exist, it creates, otherwise updates.
   * Function ignores (does not set to null) undefined (options) fields
   * from the passed model.
   *
   * @param erc20GatewayTokenPair ERC20GatewayTokenPair model to upsert.
   *
   * @returns Upserted ERC20GatewayTokenPair model (with all saved fields).
   */
  public async save(erc20GatewayTokenPair: ERC20GatewayTokenPair): Promise<ERC20GatewayTokenPair> {
    const definedOwnProps: string[] = Utils.getDefinedOwnProps(erc20GatewayTokenPair);

    await ERC20GatewayTokenPairModel.upsert(
      erc20GatewayTokenPair,
      {
        fields: definedOwnProps,
      },
    );

    const upsertedModel: ERC20GatewayTokenPair | null = await this.get(
      erc20GatewayTokenPair.gatewayGA, erc20GatewayTokenPair.valueToken,
    );
    assert(upsertedModel !== undefined);

    this.newUpdate(upsertedModel as ERC20GatewayTokenPair);

    return upsertedModel as ERC20GatewayTokenPair;
  }

  /**
   * Returns a ERC20GatewayTokenPair model with the specified erc20 gateway
   * address and value token or null if there is no one.
   *
   * @param gatewayGA Gateway global address of the ERC20GatewayTokenPair model.
   * @param valueToken Value token address of the ERC20GatewayTokenPair model.
   *
   * @returns ERC20GatewayTokenPair model if exists, otherwise null.
   */
  public async get(
    gatewayGA: string, valueToken: string,
  ): Promise<ERC20GatewayTokenPair | null> {
    const databaseModel = await ERC20GatewayTokenPairModel.findOne({
      where: {
        gatewayGA,
        valueToken,
      },
    });

    if (databaseModel === null) {
      return null;
    }

    return this.convertToModel(databaseModel);
  }


  /* Private Functions */

  /**
   * convertToModel() function converts the given database model
   * to ERC20GatewayTokenPair model.
   *
   * @param databaseModel Database model to convert to ERC20GatewayTokenPair model.
   *
   * @returns Converted ERC20GatewayTokenPair model.
   */
  private convertToModel(
    databaseModel: ERC20GatewayTokenPairModel,
  ): ERC20GatewayTokenPair {
    return new ERC20GatewayTokenPair(
      databaseModel.gatewayGA,
      databaseModel.valueToken,
      databaseModel.utilityToken,
      databaseModel.createdAt,
      databaseModel.updatedAt,
    );
  }
}
