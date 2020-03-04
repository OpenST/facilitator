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

import assert from 'assert';
import commander from 'commander';

import Container from '../Container';
import Logger from '../../common/Logger';
import Manifest from '../manifest/Manifest';
import SeedDataInitializer from '../SeedDataInitializer';

commander
  .option('-m, --manifest <manifest>', 'Path to manifest file.')
  .action(
    async (
      options: {
        manifest: string;
      }): Promise<void> => {
      try {
        const manifest = Manifest.fromFile(options.manifest);
        const {
          facilitator,
          repositories,
        } = await Container.create(manifest);

        const seedDataInitializer = new SeedDataInitializer(repositories);
        assert.ok(seedDataInitializer.isValidSeedData(
          manifest.originContractAddresses.erc20_gateway,
        ));

        await facilitator.start();
      } catch (e) {
        Logger.error(`Error in facilitator start command. Reason: ${e.message}`);
      }
    },
  );
