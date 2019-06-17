import * as path from 'path';
import * as os from 'os';

/**
 * Directory provides operations on strings representing directories.
 */
export class Directory {

  /**
   * @returns {string} It returns mosaic directory path.
   */
  public static getMosaicDirectoryPath(): string {
    return path.join(
      os.homedir(),
      '.mosaic'
    );
  }

  /**
   * @returns {string} It returns facilitator directory path. // TODO: check only returning string.
   */
  public static getFacilitatorDirectoryPath(): string {
    return path.join(
      'facilitator'
    );
  }

  /**
   * @returns {string} It returns file path where db is present.
   */
  public static getDBFilePath(): string {
    return path.join(
      Directory.getMosaicDirectoryPath(),
      Directory.getFacilitatorDirectoryPath()
    );
  }

}