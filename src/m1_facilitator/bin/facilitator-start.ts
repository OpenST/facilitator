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

import Facilitator from '../Facilitator';
import FacilitatorStart from '../commands/FacilitatorStart';
import Logger from '../../common/Logger';

let facilitator: Facilitator;

async function terminationHandler(): Promise<void> {
  Logger.info('facilitator-start::Stopping facilitator');
  if (facilitator) {
    await facilitator.stop();
  }
  Logger.info('facilitator-start::Facilitator stopped');
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
        await new FacilitatorStart(options.manifest).execute();
      } catch (e) {
        Logger.error(`facilitator-start::Error in facilitator start command. Reason: ${e.message}`);
        process.exit(1);
      }
    },
  ).parse(process.argv);
