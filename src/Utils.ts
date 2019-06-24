import * as fs from 'fs-extra';

export default class Utils {
  /**
   * Get config json data from the given file path.
   * @param filePath Config file path.
   * @returns JSON data from config file.
   */
  public static getJsonDataFromPath(filePath: string): Record<string, any> {
    if (fs.existsSync(filePath)) {
      const config = fs.readFileSync(filePath).toString();
      if (config && config.length > 0) {
        return JSON.parse(config);
      }
      throw new Error('Empty file.');
    }
    throw new Error('File not found.');
  }
}
