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

import { InitOptions, Sequelize } from 'sequelize';

import WithdrawIntentRepository from './WithdrawIntentRepository';
import AnchorRepository from './AnchorRepository';
import DepositIntentRepository from './DepositIntentRepository';

export default class Repositories {
  /* Storage */

  public withdrawIntentRepository: WithdrawIntentRepository;

  public anchorRepository: AnchorRepository;

  public depositIntentRepository: DepositIntentRepository;

  /* Public Functions */

  /**
   * Creates a repositories object.
   *
   * @param storage A repositories file path or ':memory' in case of in
   *                memory representation.
   */
  public static async create(storage = ':memory:'): Promise<Repositories> {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage,
      logging: false,
      typeValidation: true,
    });

    const db = new Repositories(sequelize);
    await sequelize.sync();

    return db;
  }

  /**
   * Notifies all repositories' observers about changes in each
   * corresponding repository.
   */
  public async notify(): Promise<void[][]> {
    const promises = [];

    promises.push(this.withdrawIntentRepository.notify());
    promises.push(this.depositIntentRepository.notify());
    promises.push(this.anchorRepository.notify());

    return Promise.all(promises);
  }

  /* Private Functions */

  /**
   * Function instantiates all repository classes by passing the following
   * configuration options:
   *    - underscored: true -- Sets field option for all attributes of all models
   *                           to snake cased name.
   *    - timestamps: true -- Adds timestamps attributes (createdAt and updatedAt) to all
   *                          objects (MessageTransferRequest, etc) of all repositories.
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

    this.withdrawIntentRepository = new WithdrawIntentRepository(initOptions);
    this.anchorRepository = new AnchorRepository(initOptions);
    this.depositIntentRepository = new DepositIntentRepository(initOptions);
  }
}
