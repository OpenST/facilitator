import * as commander from 'commander';
import {Account} from "../Account";
import Logger from '../Logger';
import * as path from 'path';
import {DBConnection} from '../DBConnection';
import {FacilitatorConfig} from "../Config";
import {Directory} from "../Directory";
import {Chain} from '../Config';

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

    const facilitatorConfig = FacilitatorConfig.from(options.chainId);

    let originChainId: number = FacilitatorConfig.getOriginChainId(options.chainId, options.mosaicConfig);
    const {
      account: auxiliaryAccount,
      encryptedAccount: auxiliaryEncryptedAccount,
    } = Account.create(new Web3(), options.auxiliaryPassword);

    const {
      account: originAccount,
      encryptedAccount: originEncryptedAccount,
    } = Account.create(new Web3(), options.originPassword);

    let dbPath: string = options.dbPath;
    if (options.dbPath === undefined || options.dbPath === null) {
      Logger.info('database host is not provided');
      DBConnection.getConnection(path.join(Directory.getMosaicDirectoryPath()));
      dbPath = DBConnection.dbFilePath;
    }

    facilitatorConfig.chains[originChainId] = new Chain();
    facilitatorConfig.chains[originChainId].worker = originAccount.address;
    facilitatorConfig.chains[originChainId].rpc = options.originRpc;

    facilitatorConfig.chains[options.chainId] = new Chain();
    facilitatorConfig.chains[options.chainId].worker = auxiliaryAccount.address;
    facilitatorConfig.chains[options.chainId].rpc = options.auxiliaryRpc;

    facilitatorConfig.encryptedAccounts[originAccount.address] = originEncryptedAccount;
    facilitatorConfig.encryptedAccounts[auxiliaryAccount.address] = auxiliaryEncryptedAccount;

    facilitatorConfig.database.host = dbPath;

    facilitatorConfig.writeToFacilitatorConfig(options.chainId, options.force);
  })
  .parse(process.argv);

