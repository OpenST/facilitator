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


import os from 'os';
import path from 'path';

/**
 * Directory provides operations on strings representing directories.
 */
export default class Directory {
  // Facilitator config file name.
  public static MOSAIC_FACILITATOR_CONFIG = 'facilitator-config.json';

  /**
   * Provides path to mosaic directory
   * @returns {string} It returns mosaic directory path.
   */
  public static getMosaicDirectoryPath(): string {
    return path.join(
      os.homedir(),
      '.mosaic',
    );
  }

  /**
   * It returns default db file path.
   * @param auxChainId Chain id of the aux chain.
   * @returns It returns file path where db is present.
   */
  public static getDBFilePath(auxChainId: number): string {
    return path.join(
      Directory.getMosaicDirectoryPath(),
      `${auxChainId}`,
      'facilitator',
    );
  }

  /**
   * This returns default facilitator config path
   * @param auxChainId Chain Identifier.
   */
  public static getFacilitatorConfigPath(auxChainId: number): string {
    return path.join(
      Directory.getMosaicDirectoryPath(),
      `${auxChainId}`,
      Directory.MOSAIC_FACILITATOR_CONFIG,
    );
  }
}
