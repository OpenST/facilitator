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

import commander from 'commander';

import Container from '../Container';
import Logger from '../../common/Logger';
import Manifest from '../manifest/Manifest';
import SeedDataInitializer from '../SeedDataInitializer';
import Facilitator from '../Facilitator';

let facilitator: Facilitator;

async function terminationHandler(): Promise<void> {
  Logger.info('Stopping facilitator');
  if (facilitator) {
    await facilitator.stop();
  }
  Logger.info('Facilitator stopped');
  process.exit(0);
}

process.on('SIGINT', terminationHandler);
process.on('SIGTERM', terminationHandler);

commander
  .option('-m, --manifest <manifest>', 'Path to manifest file.')
  .action(
    async (
      options: {
        manifest: string;
      }): Promise<void> => {
      try {
        const manifest = Manifest.fromFile(options.manifest);
		let repositories;
        {
          facilitator,
          repositories,
        } = await Container.create(manifest);

        const seedDataInitializer = new SeedDataInitializer(repositories);
        const isSeedDataValid = await seedDataInitializer.isValidSeedData(
          manifest.originContractAddresses.erc20_gateway,
        );
        if (!isSeedDataValid) {
          throw new Error('Seed data validation has failed.');
        }

         await facilitator.start();
      } catch (e) {
        Logger.error(`Error in facilitator start command. Reason: ${e.message}`);
      }
    },
  );
