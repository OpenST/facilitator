import * as commander from 'commander';
import {Utils} from '../lib/utils';
import {Account} from "../Account";
import Logger from '../Logger';
import * as os from 'os';
import * as path from 'path';
import {DBConnection} from '../DBConnection';
import {FacilitatorInit} from "../FacilitatorInit";

const Web3 = require('web3');

commander
  .option('-mc, --mosaic-config <mosaic-config>', 'path to mosaic configuration')
  .option('-d, --chain-id <chain-id>', 'auxiliary chain id')
  .option('-op, --origin-password <origin-password>', 'origin chain account password')
  .option('-ap, --auxiliary-password <auxiliary-password>', 'auxiliary chain account password')
  .option('-or, --origin-rpc <origin-rpc>', 'origin chain rpc')
  .option('-ar, --auxiliary-rpc <auxiliary-rpc>', 'auxiliary chain rpc')
  .option('-h, --db-host <db-host>', 'path where db path is present')
  .action((options) => {

    const facilitatorInit = new FacilitatorInit(options);

    facilitatorInit.isFacilitatorConfigPreset();

    let originChainId: number = Utils.getOriginChainId(options.chainId, options.mosaicConfig);

    const {
      account: auxiliaryAccount,
      encryptedAccount: auxiliaryEncryptedAccount,
    } = Account.create(new Web3(), options.auxiliaryPassword);

    const {
      account: originAccount,
      encryptedAccount: originEncryptedAccount,
    } = Account.create(new Web3(), options.originPassword);

    let dbHost:string = options.dbHost;
    if (options.dbHost === undefined || options.dbHost === null) {
      Logger.info('database host is not provided');
      DBConnection.getConnection(path.join(os.homedir(), facilitatorInit.defaultDirPath, options.chainId));
      dbHost = DBConnection.dbFilePath;
    }

    facilitatorInit.generateFacilitatorConfig(
      dbHost,
      auxiliaryAccount,
      originAccount,
      auxiliaryEncryptedAccount,
      originEncryptedAccount,
      originChainId
    );
  })
  .parse(process.argv);

