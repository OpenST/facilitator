import * as path from 'path';
import * as os from 'os';

const MOSAIC_CONFIG_FILE = 'mosaic.json';
/**
 * Directory provides operations on strings representing directories.
 */
export default class Directory {
  // Facilitator config file name.
  public static MOSAIC_FACILITATOR_CONFIG = 'facilitator-config.json';

  /**
   * Provides path to mosaic directory
   * @returns {string} It returns mosaic directory path.
   */
  public static getMosaicDirectoryPath(): string {
    return path.join(
      os.homedir(),
      '.mosaic',
    );
  }

  /**
   * It returns default db file path.
   * @param chain Chain id of the aux chain.
   * @returns {string} It returns file path where db is present.
   */
  public static getDBFilePath(chain: string): string {
    return path.join(
      Directory.getMosaicDirectoryPath(),
      chain,
      'facilitator',
    );
  }

  /**
   * @returns The absolute path to the directory in which we store mosaic data.
   */
  public static get getDefaultMosaicDataDir(): string {
    return path.join(
      os.homedir(),
      '.mosaic',
    );
  }

  /**
   * @returns The absolute path to the directory in which we publish mosaic configs.
   */
  public static get getPublishMosaicConfigDir(): string {
    return path.join(
      Directory.getDefaultMosaicDataDir,
      'configs',
    );
  }

  /**
   * This returns default facilitator config path
   * @param chain Chain Identifier.
   */
  public static getFacilitatorConfigPath(chain: string): string {
    return path.join(
      Directory.getMosaicDirectoryPath(),
      chain,
      Directory.MOSAIC_FACILITATOR_CONFIG,
    );
  }
  
  /**
   * @returns The absolute path to the root of this project.
   */
  public static get projectRoot(): string {
    return path.join(
      __dirname,
      '..',
    );
  }

  /**
   * @param originChain The origin chain identifier.
   * @param auxiliaryChainId The auxiliary chain id of the chain.
   * @returns The absolute path to the directory of the given utility chain.
   * @throws If `auxiliaryChainId` or `originChain` is an empty string.
   */
  public static getProjectUtilityChainDir(
    originChain: string,
    auxiliaryChainId: string,
  ): string {
    if (originChain === undefined || originChain.length === 0) {
      throw new Error('Origin chain identifier cannot be empty in order to get its directory');
    }
    if (auxiliaryChainId === undefined || auxiliaryChainId.length === 0) {
      throw new Error('Auxiliary chain id cannot be empty in order to get its directory');
    }

    return path.join(
      Directory.projectRoot,
      'chains',
      originChain,
      auxiliaryChainId,
    );
  }

  /**
   * @returns The absolute path to the directory of the Graph code.
   */
  public static getProjectGraphDir(): string {
    return path.join(
      Directory.projectRoot,
      'src',
      'Graph',
    );
  }

  /**
   * @param {string} subGraphType
   * @returns The absolute path to the directory of the auto generated Graph code.
   */
  public static getProjectAutoGenGraphDir(subGraphType: string): string {
    return path.join(
      Directory.projectRoot,
      'graph',
      subGraphType,
    );
  }

  /**
   *
   * @param {string} originChain
   * @param {string} auxiliaryChain
   * @return {string}
   */
  public static getOriginSubGraphProjectDirSuffix(
    originChain: string,
    auxiliaryChain: string,
  ): string {
    return path.join(
      originChain,
      'origin',
      'subgraph',
      auxiliaryChain,
    );
  }

  /**
   * @param originChain Origin chain.
   * @param auxiliaryChain auxiliary chain id.
   * @return path
   */
  public static getAuxiliarySubGraphProjectDirSuffix(
    originChain: string,
    auxiliaryChain: string,
  ): string {
    return path.join(
      originChain,
      auxiliaryChain,
      'subgraph',
      auxiliaryChain,
    );
  }

  /**
   * @returns The absolute path to the directory where we copy code temporarily to deploy graph.
   */
  public static get getTempGraphInstallationDir(): string {
    return path.join(
      Directory.getDefaultMosaicDataDir,
      'temp',
    );
  }

  /**
   * Sanitizes given directory strings:
   * - replaces `~` at the beginning with the absolute path to the home directory.
   * - translates relative paths to absolute paths.
   * @param directory The directory string to sanitize.
   */
  public static sanitize(directory: string): string {
    let sanitized: string = directory;

    if (sanitized.substr(0, 1) === '~') {
      sanitized = path.join(os.homedir(), sanitized.substr(1));
    }

    // Relative directory name
    if (sanitized.substr(0, 1) !== '/') {
      sanitized = path.join(
        process.cwd(),
        sanitized,
      );
    }

    return sanitized;
  }

  /**
   * Returns the mosaic json file name.
   */
  public static getMosaicFileName(): string {
    return MOSAIC_CONFIG_FILE;
  }


}
