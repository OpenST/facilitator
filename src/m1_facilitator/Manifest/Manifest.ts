// Copyright 2020 OpenST Ltd.
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

import fs from 'fs-extra';
import yaml from 'js-yaml';
import { Validator as JsonSchemaVerifier } from 'jsonschema';
import schema from './manifest.schema.json';

/**
 * The class holds database configurations.
 */
export class DBConfig {
  /** Database path */
  public path: string;

  public constructor() {
    this.path = '';
  }
}

export class Account {
  public readonly keystorePath: string;

  public readonly keystorePasswordPath: string;

  public constructor(keystorePath: string, keystorePasswordPath: string) {
    this.keystorePath = keystorePath;
    this.keystorePasswordPath = keystorePasswordPath;
  }
}

/**
 * It holds chain and graph information.
 */
export class Chain {
  /** Chain rpc endpoint. */
  public readonly nodeRpcEndpoint: string;

  /** Subgraph web socket endpoint */
  public readonly graphWsEndpoint: string;

  /** Subgraph rpc endpoint */
  public readonly graphRpcEndpoint: string;

  /** Worker address. */
  public readonly worker: string;

  /** Worker password. */
  private readonly password: string;

  public constructor(
    nodeRpcEndpoint: string,
    graphWsEndpoint: string,
    graphRpcEndpoint: string,
    worker: string,
    password: string,
  ) {
    this.nodeRpcEndpoint = nodeRpcEndpoint;
    this.graphWsEndpoint = graphWsEndpoint;
    this.graphRpcEndpoint = graphRpcEndpoint;
    this.worker = worker;
    this.password = password;
  }

  /**
   * Get the password for unlocking worker.
   */
  public getPassword(): string {
    return this.password;
  }
}

/**
 * Represent metachain which contains origin and auxiliary chain objects.
 */
export class Metachain {
  public readonly originChain: Chain;

  public readonly auxChain: Chain;

  public constructor(originChain: Chain, auxChain: Chain) {
    this.originChain = originChain;
    this.auxChain = auxChain;
  }
}

/**
 * The object represents facilitator manifest values.
 */
export default class Manifest {
  public readonly version: string;

  public readonly architectureLayout: string;

  public readonly personas: string[];

  public readonly chain: string;

  public readonly metachain: Metachain;

  public readonly dbConfig: DBConfig;

  public readonly accounts: Record<string, any>;

  public readonly originContractAddresses: string[];

  public readonly tokens: string[];

  /**
   * Constructor.
   *
   * @param config Facilitator manifest yaml object.
   */
  private constructor(config: any) {
    this.version = config.version;
    this.architectureLayout = config.architecture_layout;
    this.personas = config.personas;
    this.chain = config.chain;
    this.metachain = config.metachain;
    this.dbConfig = new DBConfig();
    this.accounts = config.accounts;
    this.originContractAddresses = config.origin_contract_addresses;
    this.tokens = config.facilitate_tokens;
  }

  /**
   * Function reads the facilitator manifest from the specified path.
   * Error is thrown if file path doesn't exist.
   * Error is thrown when manifest schema is not correctly validated.
   *
   * @param manifestPath Path to facilitator yaml manifest file.
   *
   * @returns Config object initialized by the specified file's content.
   */
  public static fromFile(manifestPath: string): Manifest {
    if (fs.existsSync(manifestPath)) {
      let manifestConfig;
      try {
        manifestConfig = yaml.safeLoad(fs.readFileSync(manifestPath, 'utf8'));
        const jsonSchemaVerifier = new JsonSchemaVerifier();
        jsonSchemaVerifier.validate(manifestConfig, schema, { throwError: true });
      } catch (e) {
        throw new Error(`Error reading facilitator manifest: ${manifestPath}, Exception: ${e.message}`);
      }
      manifestConfig.metachain = Manifest.getMetachain(manifestConfig);
      manifestConfig.accounts = Manifest.getAccounts(manifestConfig);
      return new Manifest(manifestConfig);
    }

    throw new Error(`Manifest file path ${manifestPath} doesn't exist.`);
  }

  private static getAccounts(config: any): Record<string, Account> {
    const avatarAccounts: Record<string, Account> = {};
    Object.keys(config.accounts).forEach((address: string): void => {
      const acc = config.accounts[address];
      avatarAccounts[address] = new Account(acc.keystore_path, acc.keystore_password_path);
    });

    return avatarAccounts;
  }

  /**
   * It constructs and sets Metachain object.
   *
   * @param config Facilitator config yaml object.
   */
  private static getMetachain(config: any): Metachain {
    const originAvatarInfo = config.accounts[config.metachain.origin.avatar_account];
    let originAvatarPassword;
    if (fs.existsSync(originAvatarInfo.keystore_password_path)) {
      originAvatarPassword = fs.readFileSync(originAvatarInfo.keystore_password_path).toString();
    } else {
      throw new Error(`Password file path ${originAvatarInfo.keystore_password_path} doesn't exist.`);
    }
    const originChain = new Chain(
      config.metachain.origin.node_endpoint,
      config.metachain.origin.graph_ws_endpoint,
      config.metachain.origin.graph_rpc_endpoint,
      config.metachain.origin.avatar_account,
      originAvatarPassword,
    );

    const auxAvatarInfo = config.accounts[config.metachain.auxiliary.avatar_account];
    let auxAvatarPassword;
    if (fs.existsSync(auxAvatarInfo.keystore_password_path)) {
      auxAvatarPassword = fs.readFileSync(originAvatarInfo.keystore_password_path).toString();
    } else {
      throw new Error(`Password file path ${originAvatarInfo.keystore_password_path} doesn't exist.`);
    }
    const auxChain = new Chain(
      config.metachain.auxiliary.node_endpoint,
      config.metachain.auxiliary.graph_ws_endpoint,
      config.metachain.auxiliary.graph_rpc_endpoint,
      config.metachain.auxiliary.avatar_account,
      auxAvatarPassword,
    );

    return new Metachain(
      originChain,
      auxChain,
    );
  }
}
