import * as commander from 'commander';
import Logger from '../Logger';
import Facilitator from '../Facilitator';
import { Config } from '../Config';
import FacilitatorStart from './FacilitatorStart';


const facilitatorCmd = commander
  .arguments('[origin_chain] [aux_chain_id]');

facilitatorCmd
  .option('-mc, --mosaic-config <mosaicConfig>', 'path to mosaic configuration')
  .option('-fc, --facilitatorCmd-config <facilitatorConfig>', 'path to facilitatorCmd configuration')
  .action(async (origin_chain, aux_chain_id, options) => {
    let configObj: Config;

    try {
      configObj = FacilitatorStart.getConfig(origin_chain, aux_chain_id, options);
      const facilitator: Facilitator = new Facilitator(configObj);
      await facilitator.start();

      Logger.info('facilitatorCmd started');
    } catch (err) {
      Logger.error(err.message);
    }
  })
  .parse(process.argv);
