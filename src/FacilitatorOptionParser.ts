import { Config, FacilitatorConfig } from './Config';
import MosaicConfig from './MosaicConfig';
import { FacilitatorStartException } from './Exception';

/**
 * It parses and evaluates input params of facilitator start command to get config object.
 */
export default class FacilitatorOptionParser {
  public originChain: string;

  public auxChain: string;

  public mosaicConfigPath: string;

  public facilitatorConfigPath: string;

  /**
   * Constructor
   * @param originChain Name of the origin chain.
   * @param auxChain Identifier of the aux chain.
   * @param mosaicConfigPath Path to mosaic config file.
   * @param facilitatorConfigPath Path to facilitator config path.
   */
  public constructor(
    originChain: string,
    auxChain: string,
    mosaicConfigPath: string,
    facilitatorConfigPath: string,
  ) {
    this.originChain = originChain === undefined ? '' : originChain.trim();
    this.auxChain = auxChain === undefined ? '' : auxChain.trim();
    this.mosaicConfigPath = mosaicConfigPath;
    this.facilitatorConfigPath = facilitatorConfigPath;
  }

  /**
   * It returns Config object encapsulating mosaic and facilitator configs.
   */
  public getConfig(): Config {
    let configObj = {} as any as Config;
    let onlyFacilitator = false;
    if (this.isOnlyFacilitatorConfigPath()) {
      onlyFacilitator = true;
      configObj = this.handleFacilitatorConfigOption();
    }

    if (onlyFacilitator === false) {
      this.isOriginAuxChainDefined();
      configObj = this.handleOriginAuxChainOption();
    }

    return configObj;
  }

  /**
   * This method returns Config object when origin chain and aux chain is defined.
   * @returns Config object encapsulating facilitator and mosaic configs.
   */
  private handleOriginAuxChainOption(): Config {
    // When facilitator config is provided.
    if (this.facilitatorConfigPath) {
      const facilitatorConfig: FacilitatorConfig = FacilitatorConfig.fromPath(
        this.facilitatorConfigPath,
      );

      this.verifyChainIdInFacilitatorConfig(facilitatorConfig);

      // when mosaic config path is given.
      if (this.mosaicConfigPath) {
        const mosaicConfig: MosaicConfig = MosaicConfig.fromFile(this.mosaicConfigPath);
        // verify origin chain and aux chain is present in mosaic config.
        this.verifyChainIdInMosaicConfig(mosaicConfig);
        return Config.getConfigFromPath(this.mosaicConfigPath, this.facilitatorConfigPath);
      }

      const mosaicConfig: MosaicConfig = MosaicConfig.fromChain(this.originChain);
      return new Config(mosaicConfig, facilitatorConfig);
    }

    if (this.mosaicConfigPath) {
      const mosaic: MosaicConfig = MosaicConfig.fromFile(this.mosaicConfigPath);
      this.verifyChainIdInMosaicConfig(mosaic);
      const facilitator = FacilitatorConfig.from(this.auxChain);
      return new Config(mosaic, facilitator);
    }

    const facilitator: FacilitatorConfig = FacilitatorConfig.from(this.auxChain);
    const mosaic: MosaicConfig = MosaicConfig.fromChain(this.originChain);
    return new Config(mosaic, facilitator);
  }

  /**
   * This method returns config object when facilitator config is provided and
   * origin chain and aux chain is not provided.
   * @returns Config object encapsulating facilitator and mosaic configs.
   */
  private handleFacilitatorConfigOption(): Config {
    let configObj = {} as any as Config;
    // When no origin and aux chain provided.
    if (this.mosaicConfigPath) {
      configObj = Config.getConfigFromPath(this.mosaicConfigPath, this.facilitatorConfigPath);
    } else {
      const facilitatorConfig: FacilitatorConfig = FacilitatorConfig.fromPath(
        this.facilitatorConfigPath,
      );
      const mosaicConfig: MosaicConfig = MosaicConfig.fromChain(
        facilitatorConfig.originChainId,
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
    if (facilitatorConfig.chains[this.auxChain] === undefined
      || facilitatorConfig.chains[this.auxChain] === null
    ) {
      throw new FacilitatorStartException(
        `facilitator config is invalid as provided auxchain ${this.auxChain} is not present`,
      );
    }

    if (facilitatorConfig.chains[this.originChain] === undefined
      || facilitatorConfig.chains[this.originChain] === null
    ) {
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
    if (!mosaicConfig.auxiliaryChains[this.auxChain]) {
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
  private isOriginAuxChainDefined(): void {
    if (this.originChain.length === 0 || this.auxChain.length === 0) {
      throw new FacilitatorStartException('both origin_chain and aux_chain_id is required');
    }
  }

  /**
   * It verifies that only facilitator config path is provided.
   * @returns `true` if only facilitator config path is present otherwise false.
   */
  private isOnlyFacilitatorConfigPath(): boolean {
    if (
      this.originChain.length === 0
      && this.auxChain.length === 0
      && this.facilitatorConfigPath !== undefined
    ) {
      return true;
    }

    return false;
  }
}
