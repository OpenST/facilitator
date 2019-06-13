const sqlite = require('sqlite3');
const path = require('path');
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
    }
    return this.connection;
  }

  /**
   * It is used to return the database file path.
   * @returns {string}
   */
  public static get dbFilePath(): string {
    return path.join(this.dbPath, this.DBName + '.db');
  }
}
