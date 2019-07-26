import { FacilitatorStartException } from '../Exception';
import { Config, FacilitatorConfig } from './Config';
import MosaicConfig from './MosaicConfig';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * This is a factory class to create config.
 */
export default class ConfigFactory {
  public originChain?: string;

  public auxChainId?: number;

  public mosaicConfigPath?: string;

  public facilitatorConfigPath?: string;

  /**
   * @param originChain Name of the origin chain.
   * @param auxChainId Identifier of the aux chain.
   * @param mosaicConfigPath Path to mosaic config file.
   * @param facilitatorConfigPath Path to facilitator config path.
   */
  public constructor(
    originChain?: string,
    auxChainId?: number,
    mosaicConfigPath?: string,
    facilitatorConfigPath?: string,
  ) {
    this.originChain = originChain;
    this.auxChainId = auxChainId;
    this.mosaicConfigPath = mosaicConfigPath;
    this.facilitatorConfigPath = facilitatorConfigPath;
  }

  /**
   * It would evaluate the parameters and return config object.
   * @returns Config object that contains mosaic and facilitator configs.
   */
  public getConfig(): Config {
    if (this.isFacilitatorConfigPathAvailable()) {
      return this.handleFacilitatorConfigOption();
    }
    return this.handleOriginAuxChainOption();
  }

  /**
   * This method returns Config object when origin chain and aux chain is defined.
   * @returns Config object encapsulating facilitator and mosaic configs.
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
        return Config.fromFile(this.mosaicConfigPath, this.facilitatorConfigPath);
      }

      const mosaicConfig: MosaicConfig = MosaicConfig.fromChain(this.originChain!);
      return new Config(mosaicConfig, facilitatorConfig);
    }

    if (this.mosaicConfigPath) {
      const mosaic: MosaicConfig = MosaicConfig.fromFile(this.mosaicConfigPath);
      this.verifyChainIdInMosaicConfig(mosaic);
      const facilitator = FacilitatorConfig.fromChain(this.auxChainId!);
      return new Config(mosaic, facilitator);
    }

    const facilitator: FacilitatorConfig = FacilitatorConfig.fromChain(this.auxChainId!);
    const mosaic: MosaicConfig = MosaicConfig.fromChain(this.originChain!);
    return new Config(mosaic, facilitator);
  }

  /**
   * This method returns config object when facilitator config is provided and
   * origin chain and aux chain is not provided.
   * @returns Config object encapsulating facilitator and mosaic configs.
   */
  private handleFacilitatorConfigOption(): Config {
    let configObj;
    // When no origin and aux chain provided.
    if (this.mosaicConfigPath) {
      configObj = Config.fromFile(this.mosaicConfigPath, this.facilitatorConfigPath!);
      this.originChain = configObj.facilitator.originChain;
      this.auxChainId = configObj.facilitator.auxChainId;
      this.verifyChainIdInMosaicConfig(configObj.mosaic);
    } else {
      const facilitatorConfig: FacilitatorConfig = FacilitatorConfig.fromFile(
        this.facilitatorConfigPath!,
      );
      const mosaicConfig: MosaicConfig = MosaicConfig.fromChain(
        facilitatorConfig.originChain,
      );
      configObj = new Config(mosaicConfig, facilitatorConfig);
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
