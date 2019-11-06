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


import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import GatewayConfig from '@openst/mosaic-chains/lib/src/Config/GatewayConfig';
import { FacilitatorStartException } from '../Exception';
import { Config, FacilitatorConfig, ConfigType } from './Config';
import GatewayAddresses from './GatewayAddresses';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * This is a factory class to create config.
 */
export default class ConfigFactory {
  public originChain?: string;

  public auxChainId?: number;

  public mosaicConfigPath?: string;

  public facilitatorConfigPath?: string;

  public gatewayConfigPath?: string;

  /**
   * @param originChain Name of the origin chain.
   * @param auxChainId Identifier of the aux chain.
   * @param mosaicConfigPath Path to mosaic config file.
   * @param facilitatorConfigPath Path to facilitator config.
   * @param gatewayConfigPath Path to gateway config.
   */
  public constructor(
    originChain?: string,
    auxChainId?: number,
    mosaicConfigPath?: string,
    facilitatorConfigPath?: string,
    gatewayConfigPath?: string,
  ) {
    this.originChain = originChain;
    this.auxChainId = auxChainId;
    this.mosaicConfigPath = mosaicConfigPath;
    this.facilitatorConfigPath = facilitatorConfigPath;
    this.gatewayConfigPath = gatewayConfigPath;
  }

  /**
   * It would evaluate the parameters and return config object.
   * @returns Config object that contains gateway and facilitator configs.
   */
  public getConfig(): Config {
    if (this.isFacilitatorConfigPathAvailable()) {
      return this.handleFacilitatorConfigOption();
    }
    return this.handleOriginAuxChainOption();
  }

  /**
   * This method returns Config object when origin chain and aux chain is defined.
   * @returns Config object encapsulating facilitator and gateway configs.
   */
  private handleOriginAuxChainOption(): Config {
    this.verifyOriginAuxChainDefined();
    // When facilitator config is provided.
    if (this.facilitatorConfigPath) {
      const facilitatorConfig: FacilitatorConfig = FacilitatorConfig.fromFile(
        this.facilitatorConfigPath,
      );
      this.verifyChainIdInFacilitatorConfig(facilitatorConfig);
      // when mosaic config path is given.
      if (this.mosaicConfigPath) {
        const mosaicConfig: MosaicConfig = MosaicConfig.fromFile(this.mosaicConfigPath);
        // verify origin chain and aux chain is present in mosaic config.
        this.verifyChainIdInMosaicConfig(mosaicConfig);
        return Config.fromFile(
          this.facilitatorConfigPath,
          this.mosaicConfigPath,
          ConfigType.MOSAIC,
        );
      }

      if (this.gatewayConfigPath) {
        return Config.fromFile(
          this.facilitatorConfigPath,
          this.gatewayConfigPath,
          ConfigType.GATEWAY,
        );
      }

      const mosaicConfig: MosaicConfig = MosaicConfig.fromChain(this.originChain!);

      return new Config(
        GatewayAddresses.fromMosaicConfig(
          mosaicConfig,
          facilitatorConfig.auxChainId,
        ),
        facilitatorConfig,
      );
    }

    if (this.mosaicConfigPath) {
      const mosaic: MosaicConfig = MosaicConfig.fromFile(this.mosaicConfigPath);
      this.verifyChainIdInMosaicConfig(mosaic);
      const facilitator = FacilitatorConfig.fromChain(
        this.originChain!,
        this.auxChainId!,
        mosaic.auxiliaryChains[this.auxChainId!].contractAddresses.auxiliary.eip20CoGatewayAddress,
      );
      return new Config(
        GatewayAddresses.fromMosaicConfig(
          mosaic,
          facilitator.auxChainId,
        ),
        facilitator,
      );
    }

    if (this.gatewayConfigPath) {
      const gatewayConfig = GatewayConfig.fromFile(this.gatewayConfigPath);
      const gatewayAddresses = GatewayAddresses.fromGatewayConfig(gatewayConfig);
      const facilitator: FacilitatorConfig = FacilitatorConfig.fromChain(
        this.originChain!,
        this.auxChainId!,
        gatewayAddresses.eip20CoGatewayAddress,
        );
      this.verifyChainIdInGatewayConfig(gatewayConfig);
      return new Config(
        gatewayAddresses,
        facilitator,
      );
    }

    // when only origin chain and aux chain id is given.
    const mosaic: MosaicConfig = MosaicConfig.fromChain(this.originChain!);

    const facilitator: FacilitatorConfig = FacilitatorConfig.fromChain(
      this.originChain!,
      this.auxChainId!,
      mosaic.auxiliaryChains[this.auxChainId!].contractAddresses.auxiliary.eip20CoGatewayAddress,
    );

    return new Config(
      GatewayAddresses.fromMosaicConfig(
        mosaic,
        facilitator.auxChainId,
      ),
      facilitator,
    );
  }

  /**
   * This method returns config object when facilitator config is provided and
   * origin chain and aux chain is not provided.
   * @returns Config object encapsulating facilitator and gateway configs.
   */
  private handleFacilitatorConfigOption(): Config {
    let configObj;
    const facilitatorConfig = FacilitatorConfig.fromFile(this.facilitatorConfigPath!);
    this.auxChainId = facilitatorConfig.auxChainId;
    this.originChain = facilitatorConfig.originChain;
    // When no origin and aux chain provided.
    if (this.mosaicConfigPath) {
      const mosaicConfig = MosaicConfig.fromFile(this.mosaicConfigPath);

      this.verifyChainIdInMosaicConfig(mosaicConfig);

      configObj = new Config(
        GatewayAddresses.fromMosaicConfig(
          mosaicConfig,
          facilitatorConfig.auxChainId,
        ),
        facilitatorConfig,
      );
    } else if (this.gatewayConfigPath) {
      const gatewayConfig = GatewayConfig.fromFile(this.gatewayConfigPath);

      this.verifyChainIdInGatewayConfig(gatewayConfig);

      configObj = new Config(
        GatewayAddresses.fromGatewayConfig(
          gatewayConfig,
        ),
        facilitatorConfig,
      );
    } else {
      // only facilitator config is given.
      if (!MosaicConfig.exists(this.originChain)) {
        throw new Error('mosaic config not found');
      }
      const mosaicConfig: MosaicConfig = MosaicConfig.fromChain(
        this.originChain,
      );

      this.verifyChainIdInMosaicConfig(mosaicConfig);
      configObj = new Config(
        GatewayAddresses.fromMosaicConfig(
          mosaicConfig,
          this.auxChainId,
        ),
        facilitatorConfig,
      );
    }
    return configObj;
  }

  /**
   * It verifies chain ids in facilitator config.
   * @param facilitatorConfig Facilitator object containing facilitator config.
   */
  private verifyChainIdInFacilitatorConfig(
    facilitatorConfig: FacilitatorConfig,
  ): void {
    if (facilitatorConfig.chains[this.auxChainId!] === undefined) {
      throw new FacilitatorStartException(
        `facilitator config is invalid as provided auxchain ${this.auxChainId} is not present`,
      );
    }

    if (facilitatorConfig.chains[this.originChain!] === undefined) {
      throw new FacilitatorStartException(
        `facilitator config is invalid as provided origin chain ${this.originChain} is not present`,
      );
    }
  }

  /**
   * It verifies chain ids in mosaic configs.
   * @param mosaicConfig Mosaic object containing mosaic config.
   */
  private verifyChainIdInMosaicConfig(
    mosaicConfig: MosaicConfig,
  ): void {
    if (mosaicConfig.auxiliaryChains[this.auxChainId!] === undefined) {
      throw new FacilitatorStartException('aux chain is not present in mosaic config');
    }
    if (mosaicConfig.originChain.chain !== this.originChain) {
      throw new FacilitatorStartException('origin chain id in mosaic config is different '
        + 'than the one provided');
    }
  }

  /**
   * It verifies chain id's in gateway config.
   * @param gatewayConfig GatewayConfig object.
   */
  private verifyChainIdInGatewayConfig(
    gatewayConfig: GatewayConfig,
  ): void {
    this.verifyChainIdInMosaicConfig(gatewayConfig.mosaicConfig);
    if (gatewayConfig.auxChainId !== this.auxChainId) {
      throw new FacilitatorStartException(
        `Aux chain id ${gatewayConfig.auxChainId} in gatewayconfig and provided auxchain id `
        + `${this.auxChainId} are not same`,
      );
    }
  }

  /**
   * It verifies whether both origin and aux chain ids are defined.
   */
  private verifyOriginAuxChainDefined(): void {
    if (this.originChain === undefined || this.auxChainId === undefined) {
      throw new FacilitatorStartException('Origin chain and auxiliary chain id both are required');
    }
  }

  /**
   * It verifies that only facilitator config path is provided.
   * @returns `true` if only facilitator config path is present otherwise false.
   */
  private isFacilitatorConfigPathAvailable(): boolean {
    return this.originChain === undefined
      && this.auxChainId === undefined
      && this.facilitatorConfigPath !== undefined;
  }
}
