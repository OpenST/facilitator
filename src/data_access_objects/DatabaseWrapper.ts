// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Database } from 'sqlite3';

import sqlite3 = require('sqlite3');
import assert = require('assert');

export default class DatabaseWrapper {
  /* Storage */

  private db: Database;


  /* Public Functions */

  /**
   * Creates a database on the filesystem.
   *
   * If a database does not exist, creates on open.
   * Opens a database in a read/write mode.
   *
   * @param dbFilePath Database's file path.
   */
  public static createFromFile(dbFilePath: string): DatabaseWrapper {
    assert.notStrictEqual(
      dbFilePath,
      '',
      'Specified database file path is an empty string.',
    );

    const db = new sqlite3.Database(
      dbFilePath,
      // eslint-disable-next-line no-bitwise
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err: Error | null): void => {
        if (err !== null) {
          throw err;
        }
      },
    );
    return new DatabaseWrapper(db);
  }

  /**
   * Creates an in memory database object.
   *
   * Opens a database in a read/write mode.
   *
   * Also see https://github.com/mapbox/node-sqlite3/wiki/API#new-sqlite3databasefilename-mode-callback
   */
  public static createInMemory(): DatabaseWrapper {
    const db = new sqlite3.Database(
      ':memory:',
      // eslint-disable-next-line no-bitwise
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err: Error | null): void => {
        if (err !== null) {
          throw err;
        }
      },
    );

    return new DatabaseWrapper(db);
  }

  /**
   * Runs the SQL query with the specified parameters.
   *
   * @param sql The SQL query to run.
   * @param params When the SQL statement contains placeholder, one can pass them here.
   *
   * Also see https://github.com/mapbox/node-sqlite3/wiki/API#databaserunsql-param--callback
   */
  public async run(sql: string, params?: any): Promise<void> {
    return new Promise(
      (resolve, reject): Database => this.db.run(
        sql, (params === undefined ? [] : params), (err: Error | null): void => {
          if (err !== null) {
            reject(err);
          } else {
            resolve();
          }
        },
      ),
    );
  }

  /**
   * Runs the SQL query with the specified parameters and returns the first result raw.
   *
   * @param sql The SQL query to run.
   * @param params When the SQL statement contains placeholder, one can pass them here.
   *
   * Also see https://github.com/mapbox/node-sqlite3/wiki/API#databasegetsql-param--callback
   */
  public async get(sql: string, params?: any): Promise<any> {
    return new Promise(
      (resolve, reject): Database => this.db.get(
        sql, (params === undefined ? [] : params), (err: Error | null, row?: any): void => {
          if (err !== null) {
            reject(err);
          } else {
            resolve(row);
          }
        },
      ),
    );
  }

  /**
   * Runs the SQL query with the specified parameters and returns all result raws.
   *
   * @param sql The SQL query to run.
   * @param params When the SQL statement contains placeholder, one can pass them here.
   *
   * Also see https://github.com/mapbox/node-sqlite3/wiki/API#databaseallsql-param--callback
   */
  public async all(sql: string, params?: any): Promise<any> {
    return new Promise(
      (resolve, reject): Database => this.db.all(
        sql, (params === undefined ? [] : params), (err: Error | null, rows?: any): void => {
          if (err !== null) {
            reject(err);
          } else {
            resolve(rows);
          }
        },
      ),
    );
  }

  /**
   * Registers a listener for the 'trace' event of the database.
   *
   * Also see https://github.com/mapbox/node-sqlite3/wiki/Debugging#databaseontrace-callback
   */
  public trace(listener: (sql: string) => void): void {
    this.db.on('trace', listener);
  }

  /**
   * Registers a listener for the 'profile' event of the database.
   *
   * Also see https://github.com/mapbox/node-sqlite3/wiki/Debugging#databaseonprofile-callback
   */
  public profile(listener: (sql: string, time: number) => void): void {
    this.db.on('profile', listener);
  }

  /**
   * Closes the database.
   *
   * Also see https://github.com/mapbox/node-sqlite3/wiki/API#databaseclosecallback
   */
  public close(): void {
    this.db.close(
      (err: Error | null): void => {
        if (err !== null) {
          throw err;
        }
      },
    );
  }


  /* Private Functions */

  private constructor(_database: Database) {
    this.db = _database;
  }
}
