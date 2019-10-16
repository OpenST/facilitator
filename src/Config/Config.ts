// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------


import fs from 'fs-extra';
import { Validator as JsonSchemaVerifier } from 'jsonschema';
import path from 'path';
import Web3 from 'web3';

import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import Account from '../Account';
import Directory from '../Directory';
import {
  FacilitatorConfigNotFoundException, InvalidFacilitatorConfigException,
  WorkerPasswordNotFoundException,
} from '../Exception';
import Logger from '../Logger';
import Utils from '../Utils';
import schema from './FacilitatorConfig.schema.json';
import GatewayAddresses from "./GatewayAddresses";

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
  public readonly nodeRpc: string;

  /** Worker address. */
  public readonly worker: string;

  /** Worker password. */
  private readonly _password?: string;

  /** Subgraph ws endpoint */
  public readonly subGraphWs: string;

  /** Subgraph rpc endpoint */
  public readonly subGraphRpc: string;

  public constructor(
    nodeRpc: string,
    worker: string,
    subGraphWs: string,
    subGraphRpc: string,
    password?: string,
  ) {
    this.nodeRpc = nodeRpc;
    this.worker = worker;
    this._password = password;
    this.subGraphWs = subGraphWs;
    this.subGraphRpc = subGraphRpc;
  }

  /**
   * Get the password for unlocking worker.
   */
  public get password(): string | undefined {
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
    this.assignDerivedParams(config);
  }

  /**
   * Assigns derived parameters.
   * @param config JSON config object.
   */
  private assignDerivedParams(config: any): void {
    const chains = config.chains || {};
    Object.keys(chains).forEach(async (identifier): Promise<void> => {
      this.chains[identifier] = new Chain(
        chains[identifier].nodeRpc,
        chains[identifier].worker,
        chains[identifier].subGraphWs,
        chains[identifier].subGraphRpc,
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

    const facilitatorConfigPath = Directory.getFacilitatorConfigPath(chain.toString());
    fs.writeFileSync(
      facilitatorConfigPath,
      JSON.stringify(this, null, '    '),
    );
    Logger.info(`Created facilitator config on path ${facilitatorConfigPath}`);
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
  private static readConfig(filePath: string): FacilitatorConfig {
    Logger.debug(`Reading facilitator config from path ${filePath}`);
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

  public gatewayAddresses: GatewayAddresses;

  private _originWeb3?: Web3;

  private _auxiliaryWeb3?: Web3;

  /**
   * It would set mosaic config and facilitator config object.
   * @param gatewayAddresses GatewayAddresses object.
   * @param facilitatorConfig Facilitator config object.
   */
  public constructor(
    gatewayAddresses: GatewayAddresses,
    facilitatorConfig: FacilitatorConfig,
  ) {
    this.gatewayAddresses = gatewayAddresses;
    this.facilitator = facilitatorConfig;
  }

  /**
   * Returns web3 provider for origin chain.
   */
  public get originWeb3(): Web3 {
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
  public get auxiliaryWeb3(): Web3 {
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
  public createWeb3Instance(chain: Chain): Web3 {
    if (!chain.password) {
      throw new WorkerPasswordNotFoundException(`password not found for ${chain.worker}`);
    }
    const account = new Account(chain.worker, this.facilitator.encryptedAccounts[chain.worker]);
    const web3 = new Web3(chain.nodeRpc);
    account.unlock(web3, chain.password);
    return web3;
  }

  /**
   * It provides config object from the path specified. This will throw if
   * mosaic config path or facilitator config path doesn't exists.
   * @param mosaicConfigPath Path to mosaic config file path.
   * @param facilitatorConfigPath Path to facilitator config file path/
   * @returns Config object consisting of gatewayAddresses and facilitator configurations.
   */
  public static fromFile(
    mosaicConfigPath: string,
    facilitatorConfigPath: string,
  ): Config {
    const mosaic: MosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);
    const facilitator: FacilitatorConfig = FacilitatorConfig.fromFile(facilitatorConfigPath);
    const gatewayAddresses = GatewayAddresses.fromMosaicConfig(mosaic, facilitator.auxChainId);
    return new Config(gatewayAddresses, facilitator);
  }

  /**
   * It provides config object from default paths. If file does not exist on
   * default location, it will initialize new config objects.
   * @param originChain Origin chain id.
   * @param  auxiliaryChain Auxiliary chain id.
   * @returns Config object consisting of gatewayAddresses and facilitator configurations.
   */
  public static fromChain(
    originChain: string,
    auxiliaryChain: number,
  ): Config {
    const mosaic: MosaicConfig = MosaicConfig.fromChain(originChain);
    const facilitator: FacilitatorConfig = FacilitatorConfig.fromChain(auxiliaryChain);
    const gatewayAddresses = GatewayAddresses.fromMosaicConfig(mosaic, auxiliaryChain);
    return new Config(gatewayAddresses, facilitator);
  }
}
