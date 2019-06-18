import {MosaicConfig} from './MosaicConfig';
import * as path from 'path';
import * as fs from 'fs-extra';
import {Directory} from "./Directory";
import Logger from "./Logger";

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

  public constructor() {

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
  public worker: string;

  public constructor() {

  }
}

/**
 * It holds contents of the facilitator config.
 */
export class FacilitatorConfig {

  public database: DBConfig;
  public chains: Record<string, Chain>;
  public encryptedAccounts: Record<string, any>;
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
      chain
    );
    fs.ensureDirSync(configPath);

    fs.writeFileSync(
      path.join(configPath, FacilitatorConfig.fileName),
      JSON.stringify(this, null, '    '),
    );
  }

  /**
   * This reads mosaic config from the json file and creates FacilitatorConfig object.
   * @param {string} chain Auxiliary chain id.
   * @returns {FacilitatorConfig} Facilitator config object.
   */
  public static from(chain: string): FacilitatorConfig {
    const facilitatorConfigPath = path.join(
      Directory.getMosaicDirectoryPath(),
      chain,
      FacilitatorConfig.fileName
    );

    if (fs.existsSync(facilitatorConfigPath)) {
      const config = fs.readFileSync(facilitatorConfigPath).toString();
      if (config && config.length > 0) {
        const jsonObject = JSON.parse(config);
        return new FacilitatorConfig(jsonObject);
      }
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
   * It verifies if facilitator config is present for a auxiliary chainid. If already present then it exits.
   * @param {string} chain Auxiliary chain id.
   */
  public static assertNotExists(chain: string): void {
    try {
      let statOutput = fs.statSync(
        path.join(Directory.getMosaicDirectoryPath(), chain, this.fileName)
      );

      if (statOutput.size > 0) {
        Logger.error('facilitator config already present. use -f option to override the existing facilitator config.');
        process.exit(1);
      }
    }
    catch (e) {
      Logger.info('creating the facilitator config');
    }
  }

  /**
   * It returns origin chainid by searching through the mosaic config.
   * @param {number} auxChainId Chain id of the auxiliary chain.
   * @param {string} mosaicConfigPath Location where the mosaic config is present.
   * @returns {number} returns chainid of the origin chain.
   */
  public static getOriginChainId(auxChainId: number, mosaicConfigPath: string): number {

    const mosaicConfig = FacilitatorConfig.parseFile(mosaicConfigPath);
    let auxChain = mosaicConfig['auxiliaryChains'][auxChainId];
    let originChainId;
    if (auxChain === null || auxChain === undefined) {
      Logger.error("aux chain id is not present in the mosaic config");
    }
    else {
      originChainId = mosaicConfig['originChain']['chain'];
    }

    return originChainId;
  }

  /**
   * It parses the file.
   * @param filePath Location of the file.
   */
  public static parseFile(filePath): any {
    if (fs.existsSync(filePath)) {
      const configFromFile = JSON.parse(fs.readFileSync(filePath).toString());
      return configFromFile;
    }
  }
}

