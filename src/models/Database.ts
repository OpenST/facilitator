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

import { Sequelize } from 'sequelize';

import { StakeRequestRepository } from './StakeRequestRepository';
import { AuxiliaryChainRepository } from './AuxiliaryChainRepository';
import { MessageRepository } from './MessageRepository';

export default class Database {
  /* Storage */

  public stakeRequestRepository: StakeRequestRepository;

  public auxiliaryChainRepository: AuxiliaryChainRepository;

  public messageRepository: MessageRepository;

  /* Public Functions */

  /**
   * Creates a database object.
   *
   * Creates an empty database if a database does not exist.
   * Opens a database in read/write mode.
   *
   * @param storage A database file path or ':memory' in case of in
   *                memory database.
   */
  public static async create(storage = ':memory:'): Promise<Database> {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage,
      logging: false,
    });

    const db = new Database(sequelize);
    await sequelize.sync();

    return db;
  }


  /* Private Functions */

  /**
   * Creates a database object.
   *
   * Function instantiates all repository classes by passing the following
   * configuration options:
   *    - underscored: true -- Sets field option for all attributes of all models
   *                           to snake cased name.
   *    - timestamps: true -- Adds timestamps attributes (createdAt and updatedAt) to all
   *                          objects (StakeRequest, etc) of all repositories.
   *    - freezeTableName: true -- Disables the modification of table names; by default
   *                               sequelize will automatically transform all passed model names
   *                               (first parameter of define) into plural.
   *
   * @param sequelize Sequelize instance.
   */
  private constructor(sequelize: Sequelize) {
    this.stakeRequestRepository = new StakeRequestRepository({
      sequelize,
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    });

    this.auxiliaryChainRepository = new AuxiliaryChainRepository({
      sequelize,
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    });

    this.messageRepository = new MessageRepository({
      sequelize,
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    });
  }
}
