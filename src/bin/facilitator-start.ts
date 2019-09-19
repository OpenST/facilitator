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


import commander from 'commander';

import Container from '../Container';
import Facilitator from '../Facilitator';
import Logger from '../Logger';

const facilitatorCmd = commander
  .arguments('[origin_chain] [aux_chain_id]');

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

facilitatorCmd
  .option('-m, --mosaic-config <mosaic-config>', 'path to mosaic configuration')
  .option('-t, --facilitator-config <facilitator-config>', 'path to facilitator configuration')
  .action(async (origin_chain, aux_chain_id, options) => {
    try {
      facilitator = await Container.create(
        origin_chain,
        aux_chain_id,
        options.mosaicConfig,
        options.facilitatorConfig,
      );
      Logger.info('facilitator starting...');
      await facilitator.start();
      Logger.info('facilitator started.');
    } catch (err) {
      Logger.error(err.message);
    }
  })
  .parse(process.argv);
