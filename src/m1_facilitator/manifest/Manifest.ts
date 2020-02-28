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
import { EncryptedKeystoreV3Json } from 'web3-eth-accounts';
import Web3 from 'web3';
import schema from './manifest.schema.json';

/**
 * Interface of facilitator manifest file input chain data. It represents below:
 * {
 *    avatar_account: ""
 *    node_endpoint: ""
 *    graph_ws_endpoint: ""
 *    graph_rpc_endpoint: ""
 * }
 */
interface ManifestChain {
  avatar_account: string;
  node_endpoint: string;
  graph_ws_endpoint: string;
  graph_rpc_endpoint: string;
}

/**
 * Interface of facilitator manifest file input account data. It represents below:
 * {
 *    keystore_path: ""
 *    keystore_password_path: ""
 * }
 */
interface ManifestAccount {
  keystore_path: string;
  keystore_password_path: string;
}

/**
 * Interface of facilitator manifest input file. It represents below:
 * {
 *    version: string
 *    architecture_layout: string
 *    personas: string[]
 *    metachain:
 *      origin: ManifestChain
 *      auxiliary: ManifestChain
 *    accounts: Record<string, ManifestAccount>
 *    origin_contract_addresses: Record<string, string>
 *    facilitate_tokens: string[]
 * }
 */
interface ManifestInfo {
  version: string;
  architecture_layout: string;
  personas: string[];
  metachain: {
    origin: ManifestChain;
    auxiliary: ManifestChain;
  };
  accounts: Record<string, ManifestAccount>;
  origin_contract_addresses: Record<string, string>;
  facilitate_tokens: string[];
}

/** Enum of architecture layouts which facilitator supports. */
enum ArchitectureLayout {
  MOSAIC1 = 'MOSAIC1',
}

/** Enum of different personas which facilitator supports. */
enum Personas {
  FACILITATOR = 'facilitator',
  VALIDATOR = 'validator'
}

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

/**
 * It holds avatar account information.
 */
export class AvatarAccount {
  public readonly keystore: EncryptedKeystoreV3Json;

  public readonly password: string;

  /**
   * Constructor.
   *
   * @param keystore Encrypted keystore.
   * @param password Keystore password.
   */
  public constructor(keystore: EncryptedKeystoreV3Json, password: string) {
    this.keystore = keystore;
    this.password = password;
  }
}

/**
 * It holds chain and graph information.
 */
export class Chain {
  /** Chain rpc/ws endpoint. */
  public readonly nodeEndpoint: string;

  /** Subgraph web socket endpoint */
  public readonly graphWsEndpoint: string;

  /** Subgraph rpc endpoint */
  public readonly graphRpcEndpoint: string;

  /** Avatar account address. */
  public readonly avatarAccount: string;

  /** Web3 object */
  public readonly web3: Web3;

  /**
   * Constructor
   *
   * @param nodeEndpoint Chain end point.
   * @param graphWsEndpoint Graph web socket end point.
   * @param graphRpcEndpoint Graph rpc end point.
   * @param avatarAccount Avatar account address.
   * @param web3 Web3 object.
   */
  public constructor(
    nodeEndpoint: string,
    graphWsEndpoint: string,
    graphRpcEndpoint: string,
    avatarAccount: string,
    web3: Web3,
  ) {
    this.nodeEndpoint = nodeEndpoint;
    this.graphWsEndpoint = graphWsEndpoint;
    this.graphRpcEndpoint = graphRpcEndpoint;
    this.avatarAccount = avatarAccount;
    this.web3 = web3;
  }
}

/**
 * Represent metachain which contains origin and auxiliary chain objects.
 */
export class Metachain {
  public readonly originChain: Chain;

  public readonly auxiliaryChain: Chain;

  /**
   * Constructor.
   *
   * @param originChain Origin chain object.
   * @param auxiliaryChain Auxiliary chain object.
   */
  public constructor(originChain: Chain, auxiliaryChain: Chain) {
    this.originChain = originChain;
    this.auxiliaryChain = auxiliaryChain;
  }
}

/**
 * The object represents facilitator manifest values.
 */
export default class Manifest {
  public readonly version: string;

  public readonly architectureLayout: ArchitectureLayout;

  public readonly personas: Personas[];

  public readonly metachain: Metachain;

  public readonly dbConfig: DBConfig;

  public readonly avatarAccounts: Record<string, AvatarAccount>;

  public readonly originContractAddresses: Record<string, string>;

  public readonly facilitateTokens: Set<string>;

  /**
   * Constructor.
   *
   * @param config Facilitator input config object.
   */
  private constructor(config: {
    version: string;
    architecture_layout: string;
    personas: string[];
    metachain: Metachain;
    accounts: Record<string, AvatarAccount>;
    origin_contract_addresses: Record<string, string>;
    facilitate_tokens: string[];
  }) {
    this.version = config.version;
    this.architectureLayout = config.architecture_layout as ArchitectureLayout;
    this.personas = config.personas as Personas[];
    this.metachain = config.metachain;
    this.dbConfig = new DBConfig();
    this.avatarAccounts = config.accounts;
    this.originContractAddresses = config.origin_contract_addresses;
    this.facilitateTokens = new Set(config.facilitate_tokens);
  }

  /**
   * Function reads the facilitator manifest from the specified path.
   * It parses the yaml manifest file.
   * Error is thrown if file path doesn't exist.
   * Error is thrown when manifest schema is not correctly validated.
   *
   * @param manifestPath Path to facilitator yaml manifest file.
   *
   * @returns Manifest object initialized by the specified file's content.
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
      manifestConfig.accounts = Manifest.getAvatarAccounts(manifestConfig);
      return new Manifest(manifestConfig);
    }

    throw new Error(`Manifest file path ${manifestPath} doesn't exist.`);
  }

  /**
   * It constructs and sets Metachain object.
   *
   * @param config Facilitator input yaml object.
   */
  private static getMetachain(config: ManifestInfo): Metachain {
    const originChain = new Chain(
      config.metachain.origin.node_endpoint,
      config.metachain.origin.graph_ws_endpoint,
      config.metachain.origin.graph_rpc_endpoint,
      config.metachain.origin.avatar_account,
      new Web3(config.metachain.origin.node_endpoint),
    );
    const auxChain = new Chain(
      config.metachain.auxiliary.node_endpoint,
      config.metachain.auxiliary.graph_ws_endpoint,
      config.metachain.auxiliary.graph_rpc_endpoint,
      config.metachain.auxiliary.avatar_account,
      new Web3(config.metachain.auxiliary.node_endpoint),
    );

    return new Metachain(
      originChain,
      auxChain,
    );
  }

  /**
   * Constructs avatar account objects.
   *
   * @param config Facilitator input yaml object
   */
  private static getAvatarAccounts(config: ManifestInfo): Record<string, AvatarAccount> {
    const avatarAccounts: Record<string, AvatarAccount> = {};
    Object.keys(config.accounts).forEach((address: string): void => {
      const acc = config.accounts[address];
      if (!fs.existsSync(acc.keystore_password_path)) {
        throw new Error(`Password file path ${acc.keystore_password_path} doesn't exist.`);
      }
      if (!fs.existsSync(acc.keystore_path)) {
        throw new Error(`Keystore file path ${acc.keystore_path} doesn't exist.`);
      }
      const keystore = fs.readFileSync(acc.keystore_path).toString();
      const password = fs.readFileSync(acc.keystore_password_path).toString();
      avatarAccounts[address] = new AvatarAccount(JSON.parse(keystore), password);
    });

    return avatarAccounts;
  }
}
