import * as os from 'os';
import Logger from "./Logger";

const path = require('path');
const fs = require('fs-extra');

/**
 * It is used for creating the facilitator config on init.
 */
export class FacilitatorInit {

  public options;

  public facilitatorConfigPath: string;

  public facilitatorConfigFileName = 'facilitator-config.json';

  /**
   * Construtor
   * @param options Object containing values which are persisted in the facilitator config.
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * It generates facilitator config file for a chain.
   * @param dbHost Database host path.
   * @param auxiliaryAccount Auxiliary account address.
   * @param originAccount Origin account address.
   * @param auxiliaryEncryptedAccount Auxiliary account encrypted keystore object.
   * @param originEncryptedAccount Origin account encrypted keystore object.
   * @param originChainId Origin chain id.
   */
  public generateFacilitatorConfig(dbHost, auxiliaryAccount, originAccount, auxiliaryEncryptedAccount, originEncryptedAccount, originChainId): void {

    let facilitatorConfig = {
      'db': {
        'db_host': dbHost
      },
      'chains': {
        [this.options.chainId]: {
          'rpc': this.options.auxiliaryRpc,
          'workers': auxiliaryAccount.address
        },
        [originChainId]: {
          'rpc': this.options.originRpc,
          'workers': originAccount.address
        }
      },
      'encrypted_accounts': {
        [auxiliaryAccount.address]: auxiliaryEncryptedAccount,
        [originAccount.address]: originEncryptedAccount
      }
    };

    fs.ensureDirSync(path.join(os.homedir(), this.defaultDirPath, this.options.chainId));
    fs.writeFileSync(this.facilitatorConfigPath, JSON.stringify(facilitatorConfig), 'utf8');
  }

  /**
   * It returns the default directory path for mosaic.
   * @returns {string}
   */
  public get defaultDirPath(): string {
    return path.join('.mosaic');
  }

  /**
   * It returns the default directory path for mosaic.
   * @returns {string}
   */
  public setFacilitatorConfigPath(): void {
    this.facilitatorConfigPath = path.join(os.homedir(), this.defaultDirPath, this.options.chainId, this.facilitatorConfigFileName);
  }

  /**
   * It verifies if facilitator config is present for the aux chainid. If already present then it exits.
   */
  public isFacilitatorConfigPreset(): void {

    this.setFacilitatorConfigPath();
    try {
      let statOutput = fs.statSync(this.facilitatorConfigPath, fs.constants.F_OK);
      if (statOutput.size > 0) {
        Logger.error('facilitator config already present');
        process.exit(1);
      }
    }
    catch (e) {
      Logger.info('creating the facilitator config');
    }
  }
}
