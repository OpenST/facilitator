import * as path from 'path';
import * as fs from 'fs-extra';
import { EncryptedKeystoreV3Json } from 'web3-eth-accounts';
import { MosaicConfig } from './MosaicConfig';
import Directory from './Directory';
import Utils from './Utils';

// Database password key to read from env.
const ENV_DB_PASSWORD = 'MOSAIC_FACILITATOR_DB_PASSWORD';

// Database type
enum DBType {
  SQLITE = 'SQLITE',
}

/**
 * Holds database configurations.
 */
export class DBConfig {
  public type: DBType;

  /** Database path */
  public path: string;

  /** Database host */
  public host: string;

  /** Database user name */
  public userName: string;

  /** Database password */
  private _password: string;

  /**
   * Get the password for the database.
   */
  get password(): string {
    return process.env[ENV_DB_PASSWORD] || this._password;
  }
}

/**
 * Holds chain data
 */
export class Chain {
  /** Chain RPC endpoint. */
  public rpc: string;

  /** Worker account object. */
  public worker: string;
}

/**
 * It holds contents of the facilitator config.
 */
export class FacilitatorConfig {
  public database: DBConfig;

  public chains: Record<string, Chain>;

  public encryptedAccounts: Record<string, EncryptedKeystoreV3Json>;

  private static fileName: string = 'facilitator-config.json';

  /**
   * Constructor.
   * @param config Facilitator config object.
   */
  private constructor(config: any) {
    this.database = config.database || new DBConfig();
    this.chains = config.chains || {};
    this.encryptedAccounts = config.encryptedAccounts || {};
  }

  /**
   * It writes facilitator config object.
   * @param {string} chain Auxiliary chain id.
   */
  public writeToFacilitatorConfig(chain: string): void {
    const mosaicConfigDir = Directory.getMosaicDirectoryPath();
    const configPath = path.join(
      mosaicConfigDir,
      chain,
    );
    fs.ensureDirSync(configPath);

    fs.writeFileSync(
      path.join(configPath, FacilitatorConfig.fileName),
      JSON.stringify(this, null, '    '),
    );
  }

  /**
   * This reads facilitator config from the json file and creates FacilitatorConfig object.
   * @param {string} chain Auxiliary chain id.
   * @returns {FacilitatorConfig} Facilitator config object.
   */
  public static from(chain: string): FacilitatorConfig {
    const facilitatorConfigPath = path.join(
      Directory.getMosaicDirectoryPath(),
      chain,
      FacilitatorConfig.fileName,
    );

    if (fs.existsSync(facilitatorConfigPath)) {
      const config = Utils.getJsonDataFromPath(facilitatorConfigPath);
      return new FacilitatorConfig(config);
    }
    return new FacilitatorConfig({});
  }

  /**
   * @returns {FacilitatorConfig} FacilitatorConfig object.
   */
  public static new(): FacilitatorConfig {
    return new FacilitatorConfig({});
  }

  /**
   * It verifies if facilitator config is present for a auxiliary chainid.
   * @param {string} chain Auxiliary chain id.
   */
  public static isFacilitatorConfigPresent(chain: string): boolean {
    const statOutput = fs.statSync(
      path.join(Directory.getMosaicDirectoryPath(), chain, this.fileName),
    );

    if (statOutput.size > 0) {
      return true;
    }
    return false;
  }
}


/**
 * Holds mosaic config, database config and facilitator config.
 */
export class Config {
  public database: DBConfig;

  public chains: Record<string, Chain>;

  public mosaic: MosaicConfig;

  /**
   * Constructor.
   * @param mosaicConfigPath Mosaic config path.
   * @param chainId Auxiliary chain id.
   */
  public constructor(
    mosaicConfigPath: string,
    chainId: string,
  ) {
    this.mosaic = MosaicConfig.fromPath(mosaicConfigPath);
    const facilitatorConfig = FacilitatorConfig.from(chainId);

    this.database = facilitatorConfig.database;
    this.chains = facilitatorConfig.chains;
  }
}
