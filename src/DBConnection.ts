import Logger from './Logger';
import * as path from 'path';
import {Directory} from './Directory';

const sqlite = require('sqlite3');
const fs = require('fs-extra');

/**
 * It is used to manage the database connection.
 */
export class DBConnection {

  private static DBName: string = 'OSTFacilitator';

  private static connection: any;

  public static dbFilePath: string;

  /**
   * It is used to return the database connection object and path of the db file.
   * @param dbPath Database file path for sqlite.

   * @returns {any} Db connection object.
   */
  public static getConnection(dbPath: string): any {
    this.dbFilePath = dbPath;

    if (this.dbFilePath === null || this.dbFilePath === undefined) {  // TODO: where to extract
      this.dbFilePath = path.join(Directory.getFacilitatorDirectoryPath());
    }
    if (this.connection === undefined || this.connection === null) {
      fs.ensureDirSync(dbPath);
      this.connection = new sqlite.Database(path.join(dbPath, `${this.DBName + '.db'}`));
      Logger.info('created database file');
    }
    return this.connection;
  }
}

