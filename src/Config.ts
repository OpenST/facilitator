import * as fs from 'fs-extra';
import { Account } from './Account';
import { MosaicConfig } from './MosaicConfig';

// Database password key to read from env.
const DB_PASSWORD = 'MOSAIC_FACILITATOR_DB_PASSWORD';

// Database type
enum DBType {
  SQLITE = 'SQLITE',
}


/**
 * Holds mosaic config, database config and facilitator config.
 */
export class Config {
  public database: DBConfig;

  public chains: Record<string, any>;

  public mosaic: MosaicConfig;

  /**
   * Constructor.
   * @param mosaicConfigPath Mosaic config path.
   * @param facilitatorConfigPath Facilitator config path.
   */
  public constructor(
    mosaicConfigPath: string,
    facilitatorConfigPath: string,
  ) {
    this.mosaic = MosaicConfig.fromPath(mosaicConfigPath);

    const facilitatorConfig = this.getConfigJsonFromPath(
      facilitatorConfigPath,
    );

    this.database = new DBConfig(facilitatorConfig);
    this.chains = this.getChains(facilitatorConfig);
  }

  /**
   * Get chain objects from given facilitator config.
   * @param facilitatorConfig Facilitator config json data.
   * @returns Array containing chain object.
   */
  private getChains(facilitatorConfig: Record<string, any>): Chain[] {
    const chainsJson: Record<string, any> = facilitatorConfig.chains;
    const chains: Chain[] = [];
    for (const key in chainsJson) {
      chains.push(new Chain(key, facilitatorConfig));
    }
    return chains;
  }

  /**
   * Get config json data from the given file path.
   * @param filePath Facilitator config file path.
   * @returns JSON data for facilitator config.
   */
  private getConfigJsonFromPath(filePath: string): Record<string, any> {
    if (fs.existsSync(filePath)) {
      const config = fs.readFileSync(filePath).toString();
      if (config && config.length > 0) {
        return JSON.parse(config);
      }
    }
    return null;
  }
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
   * Constructor.
   * @param facilitatorConfig Facilitator config json data.
   */
  public constructor(facilitatorConfig: Record<string, any>) {
    const dbJson: Record<string, any> = facilitatorConfig.database;
    this.type = dbJson.type;
    this.path = dbJson.path;
    this.host = dbJson.host;
    this.userName = dbJson.user_name;
    this._password = dbJson.password;
  }

  /**
   * Get the password for the database.
   */
  get password(): string {
    return process.env.MOSAIC_FACILITATOR_DB_PASSWORD || this._password;
  }
}

/**
 * Holds chain data
 */
export class Chain {
  /** Chain RPC endpoint. */
  public rpc: string;

  /** Worker account object. */
  public worker: Account;

  /**
   * Constructor.
   * @param chainId Chain id.
   * @param facilitatorConfig Facilitator config json data.
   */
  public constructor(readonly chainId: string, facilitatorConfig: Record<string, any>) {
    const chainData = facilitatorConfig.chains[chainId];
    this.rpc = chainData.rpc;
    this.worker = new Account(
      chainData.worker,
      facilitatorConfig.encrypted_accounts[chainData.worker],
    );
  }
}
