import * as commander from 'commander';
import Logger from '../Logger';
import Facilitator from '../Facilitator';
import {Config} from '../Config';
import FacilitatorCommand from "./FacilitatorCommand";


// TODO: readme.
let facilitator = commander
  .arguments('[origin_chain] [aux_chain_id]');

facilitator
  .option('-mc, --mosaic-config <mosaic-config>', 'path to mosaic configuration')
  .option('-fc, --facilitator-config <facilitator-config>', 'path to facilitator configuration')
  .action(async (origin_chain, aux_chain_id, options) => {
    let configObj: Config;

    try {
    configObj = FacilitatorCommand.getConfig(origin_chain, aux_chain_id, options);

    const facilitator: Facilitator = new Facilitator(configObj);
    await facilitator.start();

    Logger.info(`facilitator started`);
    }
    catch (err) {
      Logger.error(err.message);
    }
  })
  .parse(process.argv);
