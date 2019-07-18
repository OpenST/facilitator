import * as path from 'path';
import * as fs from 'fs-extra';
import { Validator as JsonSchemaVerifier } from 'jsonschema';
import MosaicConfig from '../MosaicConfig';
import Directory from '../Directory';
import {
  FacilitatorConfigNotFoundException,
  InvalidFacilitatorConfigException,
  WorkerPasswordNotFoundException,
} from '../Exception';
import * as schema from './FacilitatorConfig.schema.json';
import Utils from '../Utils';
import Account from '../Account';

const Web3 = require('web3');

// Database password key to read from env.
const ENV_DB_PASSWORD = 'MOSAIC_FACILITATOR_DB_PASSWORD';
export const ENV_WORKER_PASSWORD_PREFIX = 'MOSAIC_ADDRESS_PASSW_';

// Database type
enum DBType {
  SQLITE = 'SQLITE',
}

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
  public readonly rpc: string;

  /** Worker address. */
  public readonly worker: string;

  /** Worker password. */
  private readonly _password?: string;

  public constructor(
    rpc: string,
    worker: string,
    password?: string,
  ) {
    this.rpc = rpc;
    this.worker = worker;
    this._password = password;
  }

  /**
   * Get the password for unlocking worker.
   */
  get password(): string | undefined {
    return process.env[`${ENV_WORKER_PASSWORD_PREFIX}${this.worker}`] || this._password;
  }
}

/**
 * It holds contents of the facilitator config.
 */
export class FacilitatorConfig {
  public originChain: string;

  public auxChainId: number;

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
        this.auxChainId = Number.parseInt(identifier, 10);
      }
    });
  }

  /**
   * It writes facilitator config object.
   * @param chain Auxiliary chain id.
   */
  public writeToFacilitatorConfig(chain: number): void {
    const mosaicConfigDir = Directory.getMosaicDirectoryPath();
    const configPath = path.join(
      mosaicConfigDir,
      chain.toString(),
    );
    fs.ensureDirSync(configPath);

    fs.writeFileSync(
      Directory.getFacilitatorConfigPath(chain.toString()),
      JSON.stringify(this, null, '    '),
    );
  }

  /**
   * This reads facilitator config from the json file and creates FacilitatorConfig object.
   * @param chain Auxiliary chain id.
   * @returns Facilitator config object.
   */
  public static fromChain(chain: number): FacilitatorConfig {
    const facilitatorConfigPath = Directory.getFacilitatorConfigPath(chain.toString());

    if (fs.existsSync(facilitatorConfigPath)) {
      return this.readConfig(facilitatorConfigPath);
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
      return this.readConfig(filePath);
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
   * This method removes config from default path.
   * @param chain Chain Identifier.
   */
  public static remove(chain: string): void {
    const facilitatorConfigPath = Directory.getFacilitatorConfigPath(chain);
    fs.removeSync(facilitatorConfigPath);
  }

  /**
   * It checks if facilitator config is present for given chain id.
   * @param chain Auxiliary chain id.
   * @returns `true` if file is present.
   */
  public static isFacilitatorConfigPresent(chain: number): boolean {
    const statOutput = fs.statSync(
      Directory.getFacilitatorConfigPath(chain.toString()),
    );
    return (statOutput.size > 0);
  }

  /**
   * This method reads config from file
   * @param filePath Absolute path of file.
   */
  private static readConfig(filePath: string) {
    const config = Utils.getJsonDataFromPath(filePath);
    FacilitatorConfig.verifySchema(config);
    return new FacilitatorConfig(config);
  }
}

/**
 * Holds mosaic config, database config and facilitator config.
 */
export class Config {
  public facilitator: FacilitatorConfig;

  public mosaic: MosaicConfig;

  private _originWeb3?: any;

  private _auxiliaryWeb3?: any;

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
   * Returns web3 provider for origin chain.
   */
  public get originWeb3(): any {
    if (this._originWeb3) {
      return this._originWeb3;
    }
    const originChain = this.facilitator.chains[this.facilitator.originChain];
    this._originWeb3 = this.createWeb3Instance(originChain);
    return this._originWeb3;
  }

  /**
   * Returns web3 provider for auxiliary chain.
   */
  public get auxiliaryWeb3(): any {
    if (this._auxiliaryWeb3) {
      return this._auxiliaryWeb3;
    }
    const auxiliaryChain = this.facilitator.chains[this.facilitator.auxChainId];
    this._auxiliaryWeb3 = this.createWeb3Instance(auxiliaryChain);
    return this._auxiliaryWeb3;
  }

  /**
   * Create web3 instance.
   * @param chain : chain object for which web3 instance needs to be created
   */
  public createWeb3Instance(chain: Chain) {
    if (!chain.password) {
      throw new WorkerPasswordNotFoundException(`password not found for ${chain.worker}`);
    }
    const account = new Account(chain.worker, this.facilitator.encryptedAccounts[chain.worker]);
    const web3 = new Web3(chain.rpc);
    account.unlock(web3, chain.password);
    return web3;
  }

  /**
   * It provides config object from the path specified. This will throw if
   * mosaic config path or facilitator config path doesn't exists.
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
   * It provides config object from default paths. If file does not exist on
   * default location, it will initialize new config objects.
   * @param originChain Origin chain id.
   * @param  auxiliaryChain Auxiliary chain id.
   * @returns Config object consisting of mosaic and facilitator configurations.
   */
  public static fromChain(
    originChain: string,
    auxiliaryChain: number,
  ): Config {
    const mosaic: MosaicConfig = MosaicConfig.fromChain(originChain);
    const facilitator: FacilitatorConfig = FacilitatorConfig.fromChain(auxiliaryChain);
    return new Config(mosaic, facilitator);
  }
}
