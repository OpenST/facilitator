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

import { DataTypes, Model, InitOptions } from 'sequelize';
import BigNumber from 'bignumber.js';

import Anchor from '../models/Anchor';
import Subject from '../../m0_facilitator/observer/Subject';
import Utils from '../../m0_facilitator/Utils';

import assert = require('assert');

/* eslint-disable class-methods-use-this */

/**
 * An interface, that represents an anchor database model.
 *
 * See: http://docs.sequelizejs.com/manual/typescript.html#usage
 */
class AnchorDatabaseModel extends Model {
  public readonly anchorGA!: string;

  public readonly lastAnchoredBlockNumber!: BigNumber;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Stores instances of Anchor models.
 *
 * Class enables creation, update and retrieval of Anchor models.
 * On construction it initializes underlying database model.
 */
export default class AnchorRepository extends Subject<Anchor> {
  /* Public Functions */

  /**
   * Initializes an underlying database model and a database table.
   * Creates database table if it does not exist.
   */
  public constructor(initOptions: InitOptions) {
    super();

    AnchorDatabaseModel.init(
      {
        anchorGA: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        lastAnchoredBlockNumber: {
          type: DataTypes.BIGINT,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
      },
      {
        ...initOptions,
        modelName: 'Anchor',
        tableName: 'anchors',
      },
    );
  }

  /**
   * Saves an anchor model in the repository.
   *
   * If the given model does not exist, it creates, otherwise updates.
   * Function ignores (does not set to null) undefined (options) fields
   * from the passed model.
   *
   * @param anchor Anchor model to upsert.
   *
   * @pre If an anchor model with the same `anchorGA` exists, asserts that
   *      stored `lastAnchoredBlockNumber` is less than the new one.
   *
   * @returns Upserted anchor model (with all saved fields).
   */
  public async save(anchor: Anchor): Promise<Anchor> {
    await AnchorRepository.assertAnchoredBlockNumber(anchor);

    const definedOwnProps: string[] = Utils.getDefinedOwnProps(anchor);

    await AnchorDatabaseModel.upsert(
      anchor,
      {
        fields: definedOwnProps,
      },
    );

    const upsertedModel: Anchor | null = await this.get(anchor.anchorGA);
    assert(upsertedModel !== undefined);

    this.newUpdate(upsertedModel as Anchor);

    return upsertedModel as Anchor;
  }

  /**
   * Returns an anchor model with the specified anchor global address or
   * null if there is no one.
   *
   * @param anchorGA Anchor's global address to retrieve.
   *
   * @returns Anchor model if exists, otherwise null.
   */
  public async get(anchorGA: string): Promise<Anchor | null> {
    const anchorDatabaseModel = await AnchorDatabaseModel.findOne({
      where: {
        anchorGA,
      },
    });

    if (anchorDatabaseModel === null) {
      return null;
    }

    return AnchorRepository.convertToModel(anchorDatabaseModel);
  }


  /* Private Functions */

  /**
   * convertToModel() function converts the given anchor database model
   * to Anchor model.
   *
   * @param anchorDatabaseModel Database model to convert to Anchor model.
   *
   * @returns Converted Anchor model.
   */
  private static convertToModel(anchorDatabaseModel: AnchorDatabaseModel): Anchor {
    return new Anchor(
      anchorDatabaseModel.anchorGA,
      new BigNumber(anchorDatabaseModel.lastAnchoredBlockNumber),
      anchorDatabaseModel.createdAt,
      anchorDatabaseModel.updatedAt,
    );
  }

  /**
   * assertAnchoredBlockNumber() function asserts that stored (if exists)
   * `lastAnchoredBlockNumber` matching to the anchorGA of the given anchor is
   * less than the `lastAnchoredBlockNumber` of the given anchor.
   *
   * @param anchor An anchor model to assert validity against the stored one.
   */
  private static async assertAnchoredBlockNumber(anchor: Anchor): Promise<void> {
    const anchorDatabaseModel = await AnchorDatabaseModel.findOne({
      where: {
        anchorGA: anchor.anchorGA,
      },
    });

    if (anchorDatabaseModel === null) {
      return;
    }

    assert(
      anchor.lastAnchoredBlockNumber.isGreaterThan(anchorDatabaseModel.lastAnchoredBlockNumber),
    );
  }
}
