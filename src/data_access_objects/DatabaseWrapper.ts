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
   * Creates a DatabaseWrapper object from a file.
   *
   * Creates an empty database object on the filesystem if database does
   * not exist by the specified path.
   * Opens a database in read/write mode.
   *
   * @param dbFilePath File path to store database.
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

  public trace(listener: (sql: string) => void): void {
    this.db.on('trace', listener);
  }

  public profile(listener: (sql: string, time: number) => void): void {
    this.db.on('profile', listener);
  }

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
