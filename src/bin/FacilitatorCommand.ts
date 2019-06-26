import {Config, FacilitatorConfig} from "../Config";
import * as path from "path";
import Directory from "../Directory";
import MosaicConfig from "../MosaicConfig";
import {FacilitatorStartException} from '../Exception';

/**
 * It parses and evaluates input params of facilitator start command to get config object.
 */
export default class FacilitatorCommand {

  /**
   *
   */
  public static getConfig(originChain: string, auxChain: string, options: any): Config {
    let configObj: Config = {} as Config;

    if ((originChain !== undefined && auxChain === undefined) ||
      (originChain === undefined && auxChain !== undefined)
    ) {
      throw new FacilitatorStartException('both origin_chain and aux_chain_id is required');
    }

    configObj = FacilitatorCommand.originAuxChainOption(originChain, auxChain, options);
    if (configObj.facilitator.originChainId === undefined) {
      throw new FacilitatorStartException('invalid origin chain id and aux chain id in facilitator config');
    }

    if (configObj === undefined && configObj === null) {
      configObj = FacilitatorCommand.facilitatorConfigOption(options);

      if (configObj.facilitator.originChainId !== undefined) {
        throw new FacilitatorStartException('neither facilitator config path nor aux_chain_id and origin-chain is present.refer readme');
      }
    }
    return configObj;
  }

  private static originAuxChainOption(originChain: string, auxChain: string, options: any): Config {
    // let configObj = new Config(MosaicConfig.fromChain(''), new FacilitatorConfig(''));
    let configObj: Config = {} as Config;
      if (originChain !== undefined && auxChain !== undefined) {
        // When facilitator config is provided
        if (options.facilitatorConfig !== undefined) {
          // verified
          let facilitatorConfig: FacilitatorConfig = FacilitatorConfig.fromPath(options.facilitatorConfig);

          if (FacilitatorCommand.verifyChainIdInFacilitatorConfig(facilitatorConfig, originChain, auxChain)) {

            if (options.mosaicConfig === undefined) { // TODO: check aux chain and origin chain is to be verified in mosaic config
              const mosaicConfig:MosaicConfig = MosaicConfig.fromChain(auxChain);
              configObj = new Config(mosaicConfig, facilitatorConfig);
            }
            else {
              // when mosaic config, facilitator config, origin chain id and aux chain id is given.
              // verify origin chain and aux chain is present in mosaic and facilitator config.

              configObj = Config.getConfigFromPath(options.mosaicConfig, options.facilitatorConfig);
            }
          }
        }
        // When mosaicConfig is provided
        else if (options.mosaicConfig !== undefined) {
          let mosaicConfig: MosaicConfig = MosaicConfig.fromFile(options.mosaicConfig);

          if ((mosaicConfig.auxiliaryChains[auxChain] !== undefined && mosaicConfig.originChain.chain !== undefined)) {

            const defaultFacilitatorConfigPath = path.join(
              Directory.getMosaicDirectoryPath(),
              auxChain,
              'facilitator-config.json'
            );
            configObj = Config.getConfigFromPath(options.mosaicConfig, defaultFacilitatorConfigPath);
          }
        }
      }
    return configObj;
  }

  private static facilitatorConfigOption(options: any): Config {
    let configObj: Config = {} as Config;
    // wen no origin and aux chain provided
    if (options.facilitatorConfig !== undefined) {

      if (options.mosaicConfig !== undefined) {
        configObj = Config.getConfigFromPath(options.mosaicConfig, options.facilitatorConfig);
      }
      else {
        let facilitatorConfig: FacilitatorConfig = FacilitatorConfig.fromPath(options.facilitatorConfig);
        const defaultMosaicConfigPath = path.join(
          Directory.getMosaicDirectoryPath(),
          `${facilitatorConfig.originChainId}.json`
        );
        configObj = Config.getConfigFromPath(defaultMosaicConfigPath, options.facilitatorConfig);
      }
    }
    return configObj;
  }

  private static verifyChainIdInFacilitatorConfig(facilitatorConfig: FacilitatorConfig, originChain: string, auxChain: string): boolean {
    if(facilitatorConfig.chains[auxChain] !== undefined && facilitatorConfig.chains[originChain] !== undefined) {
      return true;
    }
    throw new FacilitatorStartException(`facilitator config is invalid as provided auxchain and originchain is not present`);
  }
}
