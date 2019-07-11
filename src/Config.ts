import * as path from 'path';
import * as fs from 'fs-extra';
import { Validator as JsonSchemaVerifier } from 'jsonschema';
import MosaicConfig from './MosaicConfig';
import Directory from './Directory';
import { InvalidFacilitatorConfigException, FacilitatorConfigNotFoundException } from './Exception';
import * as schema from './Config/FacilitatorConfig.schema.json';
import Utils from './Utils';

// Database password key to read from env.
const ENV_DB_PASSWORD = 'MOSAIC_FACILITATOR_DB_PASSWORD';

// Database type
enum DBType {
  SQLITE = 'SQLITE',
}

// Facilitator config file name.
const MOSAIC_FACILITATOR_CONFIG = 'facilitator-config.json';

/**
 * Holds database configurations.
 */
export class DBConfig {
  public type?: DBType;

  /** Database path */
  public path?: string;

  /** Database host */
  public host?: string;

  /** Database user name */
  public userName?: string;

  /** Database password */
  private _password?: string;

  /**
   * Get the password for the database.
   */
  public get password(): string | undefined {
    return process.env[ENV_DB_PASSWORD] || this._password;
  }
}

/**
 * Holds chain data
 */
export class Chain {
  /** Chain RPC endpoint. */
  public rpc?: string;

  /** Worker address. */
  public worker?: string;

  public constructor(
    rpc: string,
    worker: string,
  ) {
    this.rpc = rpc;
    this.worker = worker;
  }
}

/**
 * It holds contents of the facilitator config.
 */
export class FacilitatorConfig {
  public originChain: string;

  public auxChainId: string;

  public database: DBConfig;

  public chains: Record<string, Chain>;

  public encryptedAccounts: Record<string, any>;

  /**
   * Constructor.
   * @param config Facilitator config object.
   */
  private constructor(config: any) {
    this.originChain = config.originChain || '';
    this.auxChainId = config.auxChainId || '';
    this.database = config.database || new DBConfig();
    this.chains = {};
    this.encryptedAccounts = config.encryptedAccounts || {};
    this.assignDerivedParams = this.assignDerivedParams.bind(this);
    this.assignDerivedParams(config);
  }

  /**
   * Assigns derived parameters.
   * @param config JSON config object.
   */
  private assignDerivedParams(config: any) {
    const chains = config.chains || {};
    Object.keys(chains).forEach(async (identifier, _) => {
      this.chains[identifier] = new Chain(
        chains[identifier].rpc,
        chains[identifier].worker,
      );
      // we have only 2 chains in config
      if (identifier !== this.originChain) {
        this.auxChainId = identifier;
      }
    });
  }

  /**
   * It writes facilitator config object.
   * @param chain Auxiliary chain id.
   */
  public writeToFacilitatorConfig(chain: string): void {
    const mosaicConfigDir = Directory.getMosaicDirectoryPath();
    const configPath = path.join(
      mosaicConfigDir,
      chain,
    );
    fs.ensureDirSync(configPath);

    fs.writeFileSync(
      path.join(configPath, MOSAIC_FACILITATOR_CONFIG),
      JSON.stringify(this, null, '    '),
    );
  }

  /**
   * This reads facilitator config from the json file and creates FacilitatorConfig object.
   * @param chain Auxiliary chain id.
   * @returns Facilitator config object.
   */
  public static fromChain(chain: string): FacilitatorConfig {
    const facilitatorConfigPath = path.join(
      Directory.getMosaicDirectoryPath(),
      chain,
      MOSAIC_FACILITATOR_CONFIG,
    );

    if (fs.existsSync(facilitatorConfigPath)) {
      const config = Utils.getJsonDataFromPath(facilitatorConfigPath);
      FacilitatorConfig.verifySchema(config);
      return new FacilitatorConfig(config);
    }
    return new FacilitatorConfig({});
  }

  /**
   * Function reads the facilitator config from the specified path.
   * If the file path does not exist empty configuration object is returned.
   * @param filePath Path to facilitator config file.
   * @returns Facilitator config object initialized by the specified file's content.
   */
  public static fromFile(filePath: string): FacilitatorConfig {
    if (fs.existsSync(filePath)) {
      const config = Utils.getJsonDataFromPath(filePath);
      return new FacilitatorConfig(config);
    }
    throw new FacilitatorConfigNotFoundException('File path doesn\'t exists');
  }

  /**
   * This method verifies json object against facilitator config schema and throws
   * an exception on failure.
   * @param jsonObject JSON object to be validated against schema.
   */
  public static verifySchema(jsonObject: any): void {
    const jsonSchemaVerifier = new JsonSchemaVerifier();
    try {
      jsonSchemaVerifier.validate(jsonObject, schema, { throwError: true });
    } catch (error) {
      throw new InvalidFacilitatorConfigException(error.message);
    }
  }

  /**
   * It checks if facilitator config is present for given chain id.
   * @param chain Auxiliary chain id.
   * @returns `true` if file is present.
   */
  public static isFacilitatorConfigPresent(chain: string): boolean {
    const statOutput = fs.statSync(
      path.join(Directory.getMosaicDirectoryPath(), chain, MOSAIC_FACILITATOR_CONFIG),
    );
    return (statOutput.size > 0);
  }
}

/**
 * Holds mosaic config, database config and facilitator config.
 */
export class Config {
  public facilitator: FacilitatorConfig;

  public mosaic: MosaicConfig;

  /**
   * It would set mosaic config and facilitator config object.
   * @param mosaicConfig Mosaic config object.
   * @param facilitatorConfig Facilitator config object.
   */
  public constructor(
    mosaicConfig: MosaicConfig,
    facilitatorConfig: FacilitatorConfig,
  ) {
    this.facilitator = facilitatorConfig;
    this.mosaic = mosaicConfig;
  }

  /**
   * It provides config object from the path specified.
   * @param mosaicConfigPath Path to mosaic config file path.
   * @param facilitatorConfigPath Path to facilitator config file path/
   * @returns Config object consisting of mosaic and facilitator configurations.
   */
  public static fromFile(
    mosaicConfigPath: string,
    facilitatorConfigPath: string,
  ): Config {
    const mosaic: MosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);
    const facilitator: FacilitatorConfig = FacilitatorConfig.fromFile(facilitatorConfigPath);

    return new Config(mosaic, facilitator);
  }

  /**
   * It provides config object from default paths.
   * @param originChain Origin chain id.
   * @param  auxiliaryChain Auxiliary chain id.
   * @returns Config object consisting of mosaic and facilitator configurations.
   */
  public static fromChain(
    originChain: string,
    auxiliaryChain: string,
  ): Config {
    const mosaic: MosaicConfig = MosaicConfig.fromChain(originChain);
    const facilitator: FacilitatorConfig = FacilitatorConfig.fromChain(auxiliaryChain);
    return new Config(mosaic, facilitator);
  }
}
