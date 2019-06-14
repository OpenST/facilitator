import { Account } from './Account';
import { MosaicConfig } from './MosaicConfig';
import Utils from './Utils';

// Database password key to read from env.
const ENV_DB_PASSWORD = 'MOSAIC_FACILITATOR_DB_PASSWORD';

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

    const facilitatorConfig = Utils.getJsonDataFromPath(
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
