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

import { InitOptions, Sequelize } from 'sequelize';

import Services from '../services/Services';
import AuxiliaryChainRepository from './AuxiliaryChainRepository';
import ContractEntityRepository from './ContractEntityRepository';
import GatewayRepository from './GatewayRepository';
import { MessageRepository } from './MessageRepository';
import MessageTransferRequestRepository from './MessageTransferRequestRepository';

export default class Repositories {
  /* Storage */

  public messageTransferRequestRepository: MessageTransferRequestRepository;

  public auxiliaryChainRepository: AuxiliaryChainRepository;

  public messageRepository: MessageRepository;

  public gatewayRepository: GatewayRepository;

  public contractEntityRepository: ContractEntityRepository;

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

    promises.push(this.messageRepository.notify());
    promises.push(this.messageTransferRequestRepository.notify());
    promises.push(this.auxiliaryChainRepository.notify());
    promises.push(this.gatewayRepository.notify());
    promises.push(this.contractEntityRepository.notify());

    return Promise.all(promises);
  }

  /**
   * This method attach services to repositories so that repositories can
   * notify about changes in model to services.
   * @param services Service container.
   */
  public attach(services: Services): void {
    this.messageTransferRequestRepository.attach(services.acceptStakeRequestService);
    this.auxiliaryChainRepository.attach(services.proveGatewayService);
    this.auxiliaryChainRepository.attach(services.proveCoGatewayService);
    this.gatewayRepository.attach(services.confirmStakeIntentService);
    this.messageRepository.attach(services.stakeProgressService);
    this.messageRepository.attach(services.redeemProgressService);
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
   * Note: messageRepository should be initialized before messageTransferRequestRepository because messageHash of
   * messageTransferRequestRepository is foreign key of messageRepository.
   * Not following this order fails lot of tests.
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
    this.messageTransferRequestRepository = new MessageTransferRequestRepository(initOptions);

    this.auxiliaryChainRepository = new AuxiliaryChainRepository(initOptions);

    this.gatewayRepository = new GatewayRepository(initOptions);

    this.contractEntityRepository = new ContractEntityRepository(initOptions);
  }
}
