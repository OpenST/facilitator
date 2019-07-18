import * as commander from 'commander';
import Logger from '../Logger';
import Facilitator from '../Facilitator';
import Container from '../Container';

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
  .option('-mc, --mosaic-config <mosaicConfig>', 'path to mosaic configuration')
  .option('-fc, --facilitator-config <facilitatorConfig>', 'path to facilitator configuration')
  .action(async (origin_chain, aux_chain_id, options) => {
    try {
      facilitator = await Container.create(
        origin_chain,
        aux_chain_id,
        options.mosaicConfig,
        options.facilitatorConfig,
      );
      facilitator.start();

      Logger.info('facilitator starting...');
      await facilitator.start();
      Logger.info('facilitator started.');
    } catch (err) {
      Logger.error(err.message);
    }
  })
  .parse(process.argv);
