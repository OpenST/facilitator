import * as commander from 'commander';
import Account from '../Account';
import Logger from '../Logger';
import DatabaseFileHelper from '../DatabaseFileHelper';
import { FacilitatorConfig, Chain } from '../Config/Config';
import Utils from '../Utils';

const Web3 = require('web3');

commander
  .option('-mc, --mosaic-config <mosaic-config>', 'path to mosaic configuration')
  .option('-c, --chain-id <chain-id>', 'auxiliary chain id')
  .option('-op, --origin-password <origin-password>', 'origin chain account password')
  .option('-ap, --auxiliary-password <auxiliary-password>', 'auxiliary chain account password')
  .option('-or, --origin-rpc <origin-rpc>', 'origin chain rpc')
  .option('-ar, --auxiliary-rpc <auxiliary-rpc>', 'auxiliary chain rpc')
  .option('-dbp, --db-path <db-path>', 'path where db path is present')
  .option('-f, --force', 'forceful override facilitator config')
  .action((options) => {
    // Validating mandatory parameters
    let mandatoryOptionMissing = false;

    if (options.mosaicConfig === undefined) {
      Logger.error('required --mosaicConfig <mosaic-config>');
      mandatoryOptionMissing = true;
    }

    if (options.chainId === undefined) {
      Logger.error('required --chainId <chain-id>');
      mandatoryOptionMissing = true;
    }

    if (options.originRpc === undefined) {
      Logger.error('required --originRpc <origin-rpc>');
      mandatoryOptionMissing = true;
    }

    if (options.auxiliaryRpc === undefined) {
      Logger.error('required --auxiliaryRpc <auxiliary-rpc>');
      mandatoryOptionMissing = true;
    }

    if (options.originPassword === undefined) {
      Logger.error('required --originPassword <origin-password>');
      mandatoryOptionMissing = true;
    }

    if (options.auxiliaryPassword === undefined) {
      Logger.error('required --auxiliaryPassword <auxiliary-password>');
      mandatoryOptionMissing = true;
    }

    if (mandatoryOptionMissing) {
      process.exit(1);
    }

    if (options.force) {
      FacilitatorConfig.remove(options.chainId);
    } else {
      try {
        if (FacilitatorConfig.isFacilitatorConfigPresent(options.chainId)) {
          Logger.error('facilitator config already present. use -f option to override the existing facilitator config.');
          process.exit(1);
        }
      } catch (e) {
        Logger.info('creating facilitator config as it is not present');
      }
    }

    const facilitatorConfig = FacilitatorConfig.fromChain(options.chainId);

    // Get origin chain id.
    const mosaicConfig = Utils.getJsonDataFromPath(options.mosaicConfig);
    const auxChain = mosaicConfig.auxiliaryChains[options.chainId];
    if (auxChain === null || auxChain === undefined) {
      Logger.error('aux chain id is not present in the mosaic config');
      process.exit(1);
    }

    const originChainId = mosaicConfig.originChain.chain;

    let { dbPath } = options;
    if (dbPath === undefined || dbPath === null) {
      Logger.info('database path is not provided');
      dbPath = DatabaseFileHelper.create(options.chainId);
    } else if (DatabaseFileHelper.verify(dbPath)) {
      Logger.info('DB file verified');
    } else {
      Logger.error('DB file doesn\'t exists or file extension is incorrect');
      process.exit(1);
    }

    facilitatorConfig.database.path = dbPath;
    facilitatorConfig.originChain = originChainId;
    facilitatorConfig.auxChainId = options.chainId;
    const setFacilitator = (chainid: string, rpc: string, password: string) => {
      const account: Account = Account.create(new Web3(), password);

      facilitatorConfig.chains[chainid] = new Chain(rpc, account.address);

      facilitatorConfig.encryptedAccounts[account.address] = account.encryptedKeyStore;
    };

    setFacilitator(originChainId, options.originRpc, options.originPassword);
    setFacilitator(options.chainId, options.auxiliaryRpc, options.auxiliaryPassword);

    facilitatorConfig.writeToFacilitatorConfig(options.chainId);
    Logger.info('facilitator config file is generated');

    Logger.info(`👉 worker address for ${originChainId} chain is` +
    `${facilitatorConfig.chains[originChainId].worker}`);

    Logger.info(`👉 worker address for ${options.chainId} chain is` +
      `${facilitatorConfig.chains[options.chainId].worker}`);
  })
  .parse(process.argv);
