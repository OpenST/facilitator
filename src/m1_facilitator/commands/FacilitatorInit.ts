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

import fs from 'fs-extra';
import Manifest from '../manifest/Manifest';
import Directory from '../Directory';
import Repositories from '../repositories/Repositories';
import SeedDataInitializer from '../SeedDataInitializer';
import Command from './Command';

/**
 * Implements logic for facilitator init.
 */
export default class FacilitatorInit implements Command {
  /** Path of manifest file. */
  private readonly manifestPath: string;

  /** Flag to indicate force init. */
  private readonly isForceInit: boolean;

  /**
   * Construct FacilitatorInit instance with params.
   *
   * @param manifestPath Path of manifest file.
   * @param isForceInit `true` for force init.
   */
  public constructor(manifestPath: string, isForceInit: boolean) {
    this.isForceInit = isForceInit;
    this.manifestPath = manifestPath;
  }

  /**
   * Executes facilitator init command
   *  - Load manifest file, if file does not exists it will throw an error.
   *  - Creates database file if does not exist.
   *  - Throw error if database file exists and force flag is true.
   *  - If force flag is true and database file exists, it creates new database
   *    file.
   *  - Create seed data records i.e. gateway, anchor and contract entities.
   */
  public async execute(): Promise<void> {
    const manifest = Manifest.fromFile(this.manifestPath);

    const gatewayAddresses = manifest.originContractAddresses.erc20_gateway;
    const databaseFilePath = Directory.getFacilitatorDatabaseFile(
      manifest.architectureLayout,
      gatewayAddresses,
    );

    const databaseFileExists = fs.existsSync(databaseFilePath);

    if (!this.isForceInit && databaseFileExists) {
      throw new Error(`Database already initialized at location ${databaseFilePath}.`
        + ' Pass force option parameter for force init');
    }

    if (this.isForceInit && databaseFileExists) {
      fs.removeSync(databaseFilePath);
    }

    // Ensures that the file exists. If the file that is requested to be
    // created is in directories that do not exist,
    // these directories are created.
    fs.ensureFileSync(databaseFilePath);

    const originWeb3 = manifest.metachain.originChain.web3;
    const auxiliaryWeb3 = manifest.metachain.auxiliaryChain.web3;

    const repositories = await Repositories.create(databaseFilePath);
    await new SeedDataInitializer(repositories).initialize(
      originWeb3,
      auxiliaryWeb3,
      gatewayAddresses,
    );
  }
}
