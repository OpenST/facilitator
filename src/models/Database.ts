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

import { Sequelize, InitOptions } from 'sequelize';

import { StakeRequestRepository } from './StakeRequestRepository';
import { AuxiliaryChainRepository } from './AuxiliaryChainRepository';
import { MessageRepository } from './MessageRepository';
import { GatewayRepository } from './GatewayRepository';

export default class Database {
  /* Storage */

  public stakeRequestRepository: StakeRequestRepository;

  public auxiliaryChainRepository: AuxiliaryChainRepository;

  public messageRepository: MessageRepository;

  public gatewayRepository: GatewayRepository;

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

  /**
   * Notifies all repositories' observers about changes in each
   * corresponding repository.
   */
  public async notify(): Promise<void[][]> {
    const promises = [];

    promises.push(this.messageRepository.notify());
    promises.push(this.stakeRequestRepository.notify());
    promises.push(this.auxiliaryChainRepository.notify());
    promises.push(this.gatewayRepository.notify());

    return Promise.all(promises);
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
    const initOptions: InitOptions = {
      sequelize,
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    };

    this.messageRepository = new MessageRepository(initOptions);

    this.stakeRequestRepository = new StakeRequestRepository(initOptions);

    this.auxiliaryChainRepository = new AuxiliaryChainRepository(initOptions);

    this.gatewayRepository = new GatewayRepository(initOptions);
  }
}
