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

import Command from './Command';
import Manifest from '../manifest/Manifest';
import Container from '../Container';
import SeedDataInitializer from '../SeedDataInitializer';

/**
 * Implements logic for facilitator start.
 */
export default class FacilitatorStart implements Command {
  private manifestPath: string;


  /**
   * Construct FacilitatorStart instance with params.
   *
   * @param manifestPath Path of manifest file.
   */
  public constructor(manifestPath: string) {
    this.manifestPath = manifestPath;
  }

  /**
   * Executes facilitator start command
   *  - Load manifest file, if file does not exists it will throw an error.
   *  - Validates seed data.
   *  - Starts the facilitator.
   */
  public async execute(): Promise<void> {
    const manifest = Manifest.fromFile(this.manifestPath);
    const {
      facilitator,
      repositories,
    } = await Container.create(manifest);

    const seedDataInitializer = new SeedDataInitializer(repositories);
    const isSeedDataValid = await seedDataInitializer.isValidSeedData(
      manifest.originContractAddresses.erc20_gateway,
    );
    if (!isSeedDataValid) {
      throw new Error('Seed data validation has failed. Rerun facilitator init with force option.');
    }

    await facilitator.start();
  }
}
