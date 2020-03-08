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

import { InitOptions, Sequelize } from 'sequelize';

import ContractEntityRepository from '../../common/repositories/ContractEntityRepository';
import RepositoriesInterface from '../../common/repositories/RepositoriesInterface';

import AnchorRepository from './AnchorRepository';
import DepositIntentRepository from './DepositIntentRepository';
import ERC20GatewayTokenPairRepository from './ERC20GatewayTokenPairRepository';
import GatewayRepository from './GatewayRepository';
import MessageRepository from './MessageRepository';
import TransactionRepository from './TransactionRepository';
import WithdrawIntentRepository from './WithdrawIntentRepository';

export default class Repositories implements RepositoriesInterface {
  /* Storage */

  public anchorRepository: AnchorRepository;

  public depositIntentRepository: DepositIntentRepository;

  public messageRepository: MessageRepository;

  public gatewayRepository: GatewayRepository;

  public withdrawIntentRepository: WithdrawIntentRepository;

  public erc20GatewayTokenPairRepository: ERC20GatewayTokenPairRepository;

  public contractEntityRepository: ContractEntityRepository;

  public originTransactionRepository: TransactionRepository;

  public auxiliaryTransactionRepository: TransactionRepository;


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

    promises.push(this.anchorRepository.notify());
    promises.push(this.depositIntentRepository.notify());
    promises.push(this.gatewayRepository.notify());
    promises.push(this.messageRepository.notify());
    promises.push(this.withdrawIntentRepository.notify());
    promises.push(this.erc20GatewayTokenPairRepository.notify());
    promises.push(this.contractEntityRepository.notify());

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

    this.anchorRepository = new AnchorRepository(initOptions);
    this.contractEntityRepository = new ContractEntityRepository(initOptions);
    this.depositIntentRepository = new DepositIntentRepository(initOptions);
    this.messageRepository = new MessageRepository(initOptions);
    this.gatewayRepository = new GatewayRepository(initOptions);
    this.withdrawIntentRepository = new WithdrawIntentRepository(initOptions);
    this.erc20GatewayTokenPairRepository = new ERC20GatewayTokenPairRepository(initOptions);
    this.originTransactionRepository = new TransactionRepository(
      initOptions, 'OriginTransaction', 'origin_transactions',
    );
    this.auxiliaryTransactionRepository = new TransactionRepository(
      initOptions, 'AuxiliaryTransaction', 'auxiliary_transactions',
    );
  }
}
