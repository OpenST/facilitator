import * as os from 'os';
import * as path from 'path';

/**
 *
 */
export class Directory {

  public static getProjectMosaicConfigDir(): string {
    return path.join(
      os.homedir(),
      '.mosaic'
    );
  }

}