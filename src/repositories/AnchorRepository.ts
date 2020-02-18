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
import Subject from '../observer/Subject';
import Utils from '../Utils';

import assert = require('assert');

/* eslint-disable class-methods-use-this */

/**
 * An interface, that represents a row from an anchor table.
 *
 * See: http://docs.sequelizejs.com/manual/typescript.html#usage
 */
class AnchorModel extends Model {
  public readonly anchorGA!: string;

  public readonly lastAnchoredBlockNumber!: BigNumber;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Stores instances of Anchor objects.
 *
 * Class enables creation, update and retrieval of Anchor objects.
 * On construction it initializes underlying database model.
 */
export default class AnchorRepository extends Subject<Anchor> {
  /* Public Functions */

  /**
   * Initializes an underlying model and a database table.
   * Creates database table if it does not exist.
   */
  public constructor(initOptions: InitOptions) {
    super();

    AnchorModel.init(
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
        modelName: 'anchor',
        tableName: 'anchor',
      },
    );
  }

  /**
   * Saves an anchor model in the repository.
   *
   * If an anchor does not exist, it creates, otherwise updates.
   * Function ignores (does not set to null) undefined (options) fields
   * from the passed anchor object.
   *
   * @param anchor Anchor object to update.
   *
   * @pre If an anchor with the same `anchorGA` exists, asserts that
   *      stored `lastAnchoredBlockNumber` is less than the new one.
   *
   * @returns Newly created or updated anchor object (with all saved fields).
   */
  public async save(anchor: Anchor): Promise<Anchor> {
    await this.assertAnchoredBlockNumber(anchor);

    const definedOwnProps: string[] = Utils.getDefinedOwnProps(anchor);

    await AnchorModel.upsert(
      anchor,
      {
        fields: definedOwnProps,
      },
    );

    const upsertedAnchor: Anchor | null = await this.get(anchor.anchorGA);
    assert(upsertedAnchor !== undefined);

    this.newUpdate(upsertedAnchor as Anchor);

    return upsertedAnchor as Anchor;
  }

  /**
   * Returns an anchor with the specified anchor global address or
   * null if there is no one.
   *
   * @param anchorGA Anchor's global address to retrieve.
   *
   * @returns Anchor object if exists, otherwise null.
   */
  public async get(anchorGA: string): Promise<Anchor | null> {
    const anchorModel = await AnchorModel.findOne({
      where: {
        anchorGA,
      },
    });

    if (anchorModel === null) {
      return null;
    }

    return this.convertToAnchor(anchorModel);
  }


  /* Private Functions */

  /**
   * convertToAnchor() function converts the given `AnchorModel` object
   * to `Anchor`.
   *
   * @param anchorModel `AnchorModel` object to convert.
   *
   * @returns Converted Anchor object.
   */
  private convertToAnchor(anchorModel: AnchorModel): Anchor {
    return new Anchor(
      anchorModel.anchorGA,
      new BigNumber(anchorModel.lastAnchoredBlockNumber),
      anchorModel.createdAt,
      anchorModel.updatedAt,
    );
  }

  /**
   * assertAnchoredBlockNumber() function asserts that stored (if exists)
   * `lastAnchoredBlockNumber` matching to the anchorGA of the given anchor is
   * less than the `lastAnchoredBlockNumber` of the given anchor.
   *
   * @param anchor An anchor object to assert validity against the stored one.
   */
  private async assertAnchoredBlockNumber(anchor: Anchor): Promise<void> {
    const anchorModel = await AnchorModel.findOne({
      where: {
        anchorGA: anchor.anchorGA,
      },
    });

    if (anchorModel === null) {
      return;
    }

    assert(anchor.lastAnchoredBlockNumber.isGreaterThan(anchorModel.lastAnchoredBlockNumber));
  }
}
