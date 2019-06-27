import * as path from 'path';
import * as fs from 'fs-extra';
import { EncryptedKeystoreV3Json } from 'web3-eth-accounts';
import { Validator as JsonSchemaVerifier } from 'jsonschema';
import { MosaicConfig } from './MosaicConfig';
import Directory from './Directory';
import InvalidFacilitatorConfigException from './Exception';
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
  get password(): string | undefined {
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
}

/**
 * It holds contents of the facilitator config.
 */
export class FacilitatorConfig {
  public database: DBConfig;

  public chains: Record<string, Chain>;

  public encryptedAccounts: Record<string, EncryptedKeystoreV3Json>;

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
      path.join(configPath, MOSAIC_FACILITATOR_CONFIG),
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
   * @param {string} chain Auxiliary chain id.
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
   * Constructor.
   * @param mosaicConfigPath Mosaic config path.
   * @param chainId Auxiliary chain id.
   */
  public constructor(
    mosaicConfigPath: string,
    chainId: string,
  ) {
    this.mosaic = MosaicConfig.fromPath(mosaicConfigPath);
    this.facilitator = FacilitatorConfig.from(chainId);
  }
}
