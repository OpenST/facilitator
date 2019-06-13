import * as fs from 'fs';
import Logger from '../Logger';

/**
 * Utility helper methods.
 */
export class Utils {

  /**
   * It returns origin chainid by searching through the mosaic config.
   * @param {number} auxChainId
   * @param {string} mosaicConfigPath
   * @returns {number}
   */
  public static getOriginChainId(auxChainId: number, mosaicConfigPath: string): number {

    const mosaicConfig = Utils.parseFile(mosaicConfigPath);
    const auxChainNames = Object.keys(mosaicConfig['auxiliaryChains']);
    let auxChainIdPresent: boolean = false;
    let originChainId: number;
    let chainName: any;
    for(let i = 0; i < auxChainNames.length && !auxChainIdPresent; i++) {
      chainName = auxChainNames[i];
      if(mosaicConfig['auxiliaryChains'][chainName].chainId == auxChainId) {
        originChainId = mosaicConfig['originChain'].chain;
        auxChainIdPresent = true;
      }
    }

    if(auxChainIdPresent == false) {
      Logger.error("aux chain id is not present in the mosaic config");
    }

    return originChainId;
  }

  /**
   * It parses the file.
   * @param filePath Location of the file.
   */
  public static parseFile(filePath) : void {

    if (fs.existsSync(filePath)) {
      const configFromFile = JSON.parse(fs.readFileSync(filePath).toString());
      return configFromFile;
    }
  }
}
