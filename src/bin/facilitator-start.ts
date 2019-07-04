import * as commander from 'commander';
import Logger from '../Logger';
import Facilitator from '../Facilitator';
import { Config } from '../Config';
import FacilitatorStart from '../FacilitatorOptionParser/FacilitatorStart';


const facilitator = commander
  .arguments('[origin_chain] [aux_chain_id]');

facilitator
  .option('-mc, --mosaic-config <mosaicConfig>', 'path to mosaic configuration')
  .option('-fc, --facilitator-config <facilitatorConfig>', 'path to facilitator configuration')
  .action(async (origin_chain, aux_chain_id, options) => {
    let configObj: Config;

    try {
      const facilitatorStart: FacilitatorStart = new FacilitatorStart(
        origin_chain,
        aux_chain_id,
        options.mosaicConfig,
        options.facilitatorConfig,
      );
      configObj = facilitatorStart.getConfig();
      const facilitator: Facilitator = new Facilitator(configObj);

      Logger.info('starting facilitator');
      await facilitator.start();
      Logger.info('facilitator started');
    } catch (err) {
      Logger.error(err.message);
    }
  })
  .parse(process.argv);
