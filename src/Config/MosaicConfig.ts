// This is temporary, `MosaicConfig` will be used from mosaic-chains.
import * as path from 'path';
import * as fs from 'fs-extra';
import { Validator } from 'jsonschema';

import Directory from '../Directory';
import { InvalidMosaicConfigException, MosaicConfigNotFoundException } from '../Exception';
import Logger from "../Logger";
const schema = require('./MosaicConfig.schema.json');

/**
 * Hold contract addresses on origin chain independent of auxiliary chain.
 */
export class OriginLibraries {
  public simpleTokenAddress?: Address;

  public merklePatriciaLibAddress?: Address;

  public gatewayLibAddress?: Address;

  public messageBusAddress?: Address;

  public ostComposerAddress?: Address;
}

/**
 * Holds origin chain specific config.
 */
export class OriginChain {
  public chain: string = '';

  public contractAddresses: OriginLibraries;

  public constructor() {
    this.contractAddresses = new OriginLibraries();
  }
}

/**
 * Contract addresses of the origin chain specific to an auxiliary chain.
 */
export class OriginContracts {
  public anchorOrganizationAddress?: Address;

  public anchorAddress?: Address;

  public ostGatewayOrganizationAddress?: Address;

  public ostEIP20GatewayAddress?: Address;
}

/**
 * Contract addresses deployed on the auxiliary chain.
 */
export class AuxiliaryContracts {
  public ostPrimeAddress?: Address;

  public anchorOrganizationAddress?: Address;

  public anchorAddress?: Address;

  public merklePatriciaLibAddress?: Address;

  public gatewayLibAddress?: Address;

  public messageBusAddress?: Address;

  public ostCoGatewayOrganizationAddress?: Address;

  public ostEIP20CogatewayAddress?: Address;
}

/**
 * Hold contract addresses of origin and auxiliary chain specific to an auxiliary chain.
 */
export class ContractAddresses {
  public origin: OriginContracts;

  public auxiliary: AuxiliaryContracts;

  public constructor() {
    this.origin = new OriginContracts();
    this.auxiliary = new AuxiliaryContracts();
  }
}

/**
 * Holds config of an auxiliary chain.
 */
export class AuxiliaryChain {
  public chainId?: number;

  public bootNodes: string[];

  public genesis?: Record<string, any>;

  public contractAddresses: ContractAddresses;

  public constructor() {
    this.bootNodes = [];
    this.contractAddresses = new ContractAddresses();
  }
}

export type Address = string;

/**
 * Holds the config of mosaic chains of a specific origin chain.
 */
export default class MosaicConfig {
  public originChain: OriginChain;

  public auxiliaryChains: { [key: string]: AuxiliaryChain };

  private constructor(config: any) {
    this.originChain = config.originChain || new OriginChain();
    this.auxiliaryChains = config.auxiliaryChains || {};
  }

  /**
   * @param originChain chain identifier
   * @return mosaic config
   */
  public static fromChain(originChain: string): MosaicConfig {
    const filePath = path.join(
      Directory.getDefaultMosaicDataDir,
      originChain,
      Directory.getMosaicFileName(),
    );

    if (fs.existsSync(filePath)) {
      const configObject = MosaicConfig.readConfigFromFile(filePath);
      return new MosaicConfig(configObject);
    }
    return new MosaicConfig({} as any);
  }

  /**
   * @param {string} filePath absolute path
   * @return {MosaicConfig}
   */
  public static fromFile(filePath: string): MosaicConfig {
    if (fs.existsSync(filePath)) {
      const configObject = MosaicConfig.readConfigFromFile(filePath);
      return new MosaicConfig(configObject);
    }
    throw new MosaicConfigNotFoundException(`Missing config file at path: ${filePath}`);
  }

  /**
   * read config from file, validate it and return as JSON object
   * @param {string} filePath
   * @return {object}
   */
  private static readConfigFromFile(filePath: string): object {
    Logger.debug(`Reading mosaic config from path ${filePath}`);
    const configString = fs.readFileSync(filePath).toString();
    if (configString && configString.length > 0) {
      const configObject = JSON.parse(configString);
      MosaicConfig.validateSchema(configObject);
      return configObject;
    }
    throw new InvalidMosaicConfigException(`blank config file found at: ${filePath}`);
  }

  /**
   * This method validate json object against mosaic config schema also throws an exception on failure.
   * @param jsonObject JSON object to be validated against schema.
   */
  private static validateSchema(jsonObject: any): void {
    const validator = new Validator();
    try {
      validator.validate(jsonObject, schema, { throwError: true });
    } catch (error) {
      throw new InvalidMosaicConfigException(error.message);
    }
  }
}
