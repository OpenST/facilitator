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
import StakeRequestRepository from './StakeRequestRepository';

export default class Database {
  /* Storage */

  public stakeRequestRepository: StakeRequestRepository;


  /* Public Functions */

  public static createInMemory(): Database {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
    });

    return new Database(sequelize);
  }

  public static createFromFile(dbFilePath: string): Database {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbFilePath,
    });

    return new Database(sequelize);
  }


  /* Private Functions */

  public constructor(sequelize: Sequelize) {
    this.stakeRequestRepository = new StakeRequestRepository(sequelize);
  }
}
