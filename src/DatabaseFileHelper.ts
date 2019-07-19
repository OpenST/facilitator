import fs from 'fs-extra';
import path from 'path';
import sqlite from 'sqlite3';

import Directory from './Directory';
import Logger from './Logger';

/**
 * It creates db file at the path.
 */
export default class DatabaseFileHelper {
  private static DBName: string = 'mosaic_facilitator';

  /**
   * It verifies whether the file path is valid.
   * @param {string} filePath Database file path.
   * @returns {boolean} `true` if file path is valid.
   */
  public static verify(filePath: string): boolean {
    if ((fs.existsSync(filePath) && (path.extname(filePath) === '.db'))) {
      Logger.info('db file verified');
      return true;
    }
    return false;
  }

  /**
   * It creates database and returns the database file path.
   * @param chain chain id of the aux chain.
   * @returns {string} Database file path.
   */
  public static create(chain: string): string {
    if (chain === null || chain.length === 0) {
      throw new Error('invalid chain id');
    }
    const dbPath: string = Directory.getDBFilePath(chain);
    fs.ensureDirSync(dbPath);
    const facilitatorConfigDB = path.join(dbPath, `${`${DatabaseFileHelper.DBName}.db`}`);
    new sqlite.Database(facilitatorConfigDB);
    return facilitatorConfigDB;
  }
}
