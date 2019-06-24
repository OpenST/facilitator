import * as path from 'path';
import * as os from 'os';

/**
 * Directory provides operations on strings representing directories.
 */
export default class Directory {
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
}
