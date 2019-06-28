import { Config, FacilitatorConfig } from '../Config';
import MosaicConfig from '../MosaicConfig';
import { FacilitatorStartException } from '../Exception';

/**
 * It parses and evaluates input params of facilitator start command to get config object.
 */
export default class FacilitatorStart {
  /**
   * It provides Config object encapsulating mosaic and facilitator configs.
   */
  public static getConfig(originChain: string, auxChain: string, options: any): Config {
    let configObj = {} as any as Config;
    let onlyFacilitator = false;
    if (
      originChain === undefined && auxChain === undefined && options.facilitatorConfig !== undefined
    ) {
      onlyFacilitator = true;
      configObj = FacilitatorStart.facilitatorConfigOption(options);
    }

    if (onlyFacilitator === false) {
      FacilitatorStart.isOriginAuxChainDefined(originChain, auxChain);
      configObj = FacilitatorStart.originAuxChainOption(originChain, auxChain, options);
    }

    return configObj;
  }

  /**
   * This method provides Config object if origin chain and aux chain is defined.
   * @param {string} originChain Chain name of the origin.
   * @param {string} auxChain Chain id of the auxiliary.
   * @param options It contains path to facilitator and mosaic config.
   * @returns {Config} Config object encapsulating facilitator and mosaic configs.
   */
  private static originAuxChainOption(originChain: string, auxChain: string, options: any): Config {
    let configObj = {} as any as Config;
    if (originChain !== undefined && auxChain !== undefined) {
      // When facilitator config is provided.
      if (options.facilitatorConfig !== undefined) {
        const facilitatorConfig: FacilitatorConfig = FacilitatorConfig.fromPath(
          options.facilitatorConfig,
        );

        if (
          FacilitatorStart.verifyChainIdInFacilitatorConfig(
            facilitatorConfig,
            originChain,
            auxChain,
          )
        ) {
          if (options.mosaicConfig === undefined) {
            const mosaicConfig: MosaicConfig = MosaicConfig.fromChain(originChain);
            configObj = new Config(mosaicConfig, facilitatorConfig);
          } else {
            // when mosaic config, facilitator config, origin chain id and aux chain id is given.
            // verify origin chain and aux chain is present in mosaic and facilitator config.
            const mosaicConfig: MosaicConfig = MosaicConfig.fromFile(options.mosaicConfig);
            FacilitatorStart.verifyChainIdInMosaicConfig(mosaicConfig, originChain, auxChain);
            configObj = Config.getConfigFromPath(options.mosaicConfig, options.facilitatorConfig);
          }
        }
      } else if (options.mosaicConfig !== undefined) {
        const mosaic: MosaicConfig = MosaicConfig.fromFile(options.mosaicConfig);
        if ((FacilitatorStart.verifyChainIdInMosaicConfig(mosaic, originChain, auxChain))) {
          const facilitator = FacilitatorConfig.from(auxChain);
          configObj = new Config(mosaic, facilitator);
        }
      } else {
        // Only origin chain and aux chain id is provided.Get the configs from default path.
        const facilitator: FacilitatorConfig = FacilitatorConfig.from(auxChain);
        const mosaic: MosaicConfig = MosaicConfig.fromChain(originChain);
        configObj = new Config(mosaic, facilitator);
      }
    }

    return configObj;
  }

  /**
   * This method provides config object when atleast facilitator config is provided.
   * @param options It contains path to facilitator and mosaic config.
   * @returns {Config} Config object encapsulating facilitator and mosaic configs.
   */
  private static facilitatorConfigOption(options: any): Config {
    let configObj = {} as any as Config;
    // wen no origin and aux chain provided
    if (options.facilitatorConfig !== undefined) {
      if (options.mosaicConfig !== undefined) {
        configObj = Config.getConfigFromPath(options.mosaicConfig, options.facilitatorConfig);
      } else {
        const facilitatorConfig: FacilitatorConfig = FacilitatorConfig.fromPath(
          options.facilitatorConfig,
        );
        const mosaicConfig: MosaicConfig = MosaicConfig.fromChain(
          facilitatorConfig.originChainId,
        );
        configObj = new Config(mosaicConfig, facilitatorConfig);
      }
    }
    return configObj;
  }

  /**
   * It verifies chain ids in facilitator config.
   * @param {FacilitatorConfig} facilitatorConfig Facilitator object containing facilitator config.
   * @param {string} originChain Chain name of the origin chain.
   * @param {string} auxChain Chain id of the auxiliary chain.
   * @returns {boolean} `true` if chain ids are present in mosaic config.
   */
  private static verifyChainIdInFacilitatorConfig(
    facilitatorConfig: FacilitatorConfig,
    originChain: string,
    auxChain: string,
  ): boolean {
    if (facilitatorConfig.chains[auxChain] === undefined
      || facilitatorConfig.chains[auxChain] === null
    ) {
      throw new FacilitatorStartException(
        `facilitator config is invalid as provided auxchain ${auxChain} is not present`,
      );
    }

    if (facilitatorConfig.chains[originChain] === undefined
      || facilitatorConfig.chains[originChain] === null
    ) {
      throw new FacilitatorStartException(
        `facilitator config is invalid as provided origin chain ${originChain} is not present`,
      );
    }
    return true;
  }

  /**
   * It verifies chain ids in mosaic configs.
   * @param {MosaicConfig} mosaicConfig Mosaic object containing mosaic config.
   * @param {string} originChain Chain name of the origin chain.
   * @param {string} auxChain Chain id of the auxiliary chain.
   * @returns {boolean} `true` if chain ids are present in mosaic config.
   */
  private static verifyChainIdInMosaicConfig(
    mosaicConfig: MosaicConfig,
    originChain: string,
    auxChain: string,
  ): boolean {
    if (mosaicConfig.auxiliaryChains[auxChain] === undefined) {
      throw new FacilitatorStartException('aux chain is not present in mosaic config');
    }

    if (mosaicConfig.originChain.chain !== originChain) {
      throw new FacilitatorStartException('origin chain id in mosaic config is different than the one provided');
    }
    return true;
  }

  /**
   * It verifies
   * @param {string} originChain
   * @param {string} auxChain
   */
  private static isOriginAuxChainDefined(originChain: string, auxChain: string): boolean {
    if (originChain === undefined || auxChain === undefined) {
      throw new FacilitatorStartException('both origin_chain and aux_chain_id is required');
    }
    return true;
  }
}
