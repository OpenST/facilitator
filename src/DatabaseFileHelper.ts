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


import fs from 'fs-extra';
import path from 'path';
import sqlite from 'sqlite3';

import Directory from './Directory';
import Logger from './Logger';
import { spawnSync } from 'child_process';

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
   * @param originChainId Origin chain id.
   * @param auxChainId chain id of the aux chain.
   * @param eip20CoGatewayAddress Gateway address of auxiliary chain.
   * @returns Database file path.
   */
  public static create(
    originChainId: string,
    auxChainId: number,
    eip20CoGatewayAddress: string,
  ): string {
    if (auxChainId === 0) {
      throw new Error(`invalid auxiliary chain id ${auxChainId}`);
    }
    const dbPath: string = Directory.getDBFilePath(
      originChainId,
      auxChainId,
      eip20CoGatewayAddress,
    );
    console.log('displaying permissions ');
    spawnSync(`ls -l ${dbPath}`, { stdio: [process.stdout, process.stderr], env: process.env });
    console.log('displaying permissions ');
    fs.ensureDirSync(dbPath);
    const facilitatorConfigDB = path.join(dbPath, `${`${DatabaseFileHelper.DBName}.db`}`);
    new sqlite.Database(facilitatorConfigDB);
    return facilitatorConfigDB;
  }
}
