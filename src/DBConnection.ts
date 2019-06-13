import Logger from './Logger';
import * as path from 'path';

const sqlite = require('sqlite3');
const fs = require('fs-extra');

/**
 * It is used to manage the database connection.
 */
export class DBConnection {

  static DBName: string = 'OSTFacilitator';

  private static connection;

  static dbPath: string;

  /**
   * It is used to return the database connection object.
   * @param dbPath Database file path for sqlite.
   */
  public static getConnection(dbPath) {
    this.dbPath = dbPath;
    if (this.connection === undefined || this.connection === null) {
      const sqlite3 = sqlite.verbose();
      fs.ensureDirSync(path.join(this.dbPath, 'facilitator'));
      this.connection = new sqlite3.Database(path.join(this.dbPath, 'facilitator', this.DBName + '.db'));
      Logger.info('created database file');
    }
    return this.connection;
  }

  /**
   * @returns {string} It is used to return the database file path.
   */
  public static get dbFilePath(): string {
    if(this.dbPath === undefined || this.dbPath === null) {
      Logger.error('database path is not set');
      return;
    }
    return path.join(this.dbPath,'facilitator', this.DBName + '.db');
  }
}

