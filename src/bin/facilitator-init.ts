import * as commander from 'commander';
import Account from '../Account';
import Logger from '../Logger';
import Database from '../Database';
import { FacilitatorConfig, Chain } from '../Config';
import Utils from '../Utils';

const Web3 = require('web3');

commander
  .option('-mc, --mosaic-config <mosaic-config>', 'path to mosaic configuration')
  .option('-d, --chain-id <chain-id>', 'auxiliary chain id')
  .option('-op, --origin-password <origin-password>', 'origin chain account password')
  .option('-ap, --auxiliary-password <auxiliary-password>', 'auxiliary chain account password')
  .option('-or, --origin-rpc <origin-rpc>', 'origin chain rpc')
  .option('-ar, --auxiliary-rpc <auxiliary-rpc>', 'auxiliary chain rpc')
  .option('-h, --db-path <db-path>', 'path where db path is present')
  .option('-f, --force', 'forceful override facilitator config')
  .action((options) => {
    if (!options.force) {
      let present: boolean;
      try {
        present = FacilitatorConfig.isFacilitatorConfigPresent(options.chainId);
      } catch (e) {
        Logger.info('creating facilitator config as it is not present');
      }
      if (present) {
        Logger.error('facilitator config already present. use -f option to override the existing facilitator config.');
        process.exit(1);
      }
    }

    const facilitatorConfig = FacilitatorConfig.new();

    // Get origin chain id.
    const mosaicConfig = Utils.getJsonDataFromPath(options.mosaicConfig);
    const auxChain = mosaicConfig.auxiliaryChains[options.chainId];
    let originChainId;
    if (auxChain === null || auxChain === undefined) {
      Logger.error('aux chain id is not present in the mosaic config');
      process.exit(1);
    } else {
      originChainId = mosaicConfig.originChain.chain;
    }


    let { dbPath } = options;
    if (options.dbPath === undefined || options.dbPath === null) {
      Logger.info('database path is not provided');
      dbPath = Database.create(options.chainId);
    } else if (Database.verify(dbPath)) {
      Logger.info('db file verified');
    } else {
      Logger.error('DB file doesn\'t or file extension is incorrect');
      process.exit(1);
    }

    const setFacilitator = (chainid, rpc, password) => {
      const account: Account = Account.create(new Web3(), password);

      facilitatorConfig.chains[chainid] = new Chain();
      facilitatorConfig.chains[chainid].worker = account.address;
      facilitatorConfig.chains[chainid].rpc = rpc;

      facilitatorConfig.encryptedAccounts[account.address] = account.encryptedKeyStore;
    };

    setFacilitator(originChainId, options.originRpc, options.originPassword);
    setFacilitator(options.chainId, options.auxiliaryRpc, options.auxiliaryPassword);
    facilitatorConfig.database.host = dbPath;

    facilitatorConfig.writeToFacilitatorConfig(options.chainId);
  })
  .parse(process.argv);
