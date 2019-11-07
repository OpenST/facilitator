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
import * as web3Utils from 'web3-utils';

/**
 * Directory provides operations on strings representing directories.
 */
export default class Directory {
  // Facilitator config file name.
  public static MOSAIC_FACILITATOR_CONFIG = 'facilitator-config.json';

  public static GATEWAY_FOLDER_PREFIX = 'gateway-';

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
   * @param originChainId Origin chain identifier.
   * @param auxChainId Chain id of the aux chain.
   * @param eip20GatewayAddress Gateway address of origin chain.
   * @returns It returns file path where db is present.
   */
  public static getDBFilePath(
    originChainId: string,
    auxChainId: number,
    eip20GatewayAddress: string,
  ): string {
    return path.join(
      Directory.getMosaicDirectoryPath(),
      originChainId,
      `${auxChainId}`,
      Directory.getGatewayFolderName(eip20GatewayAddress),
    );
  }

  /**
   * This returns default facilitator config path
   * @param originChainId Origin chain Identifier.
   * @param auxChainId Auxiliary chain Identifier.
   * @param eip20GatewayAddress Gateway address of origin chain.
   */
  public static getFacilitatorConfigPath(
    originChainId: string,
    auxChainId: number,
    eip20GatewayAddress: string,
  ): string {
    return path.join(
      Directory.getMosaicDirectoryPath(),
      originChainId,
      `${auxChainId}`,
      Directory.getGatewayFolderName(eip20GatewayAddress),
      Directory.MOSAIC_FACILITATOR_CONFIG,
    );
  }

  /**
   * It prepends `GATEWAY_FOLDER_PREFIX` prefix to the input parameter.
   * @param suffix Suffix for the folder creation.
   * @returns Name of the gateway folder.
   */
  private static getGatewayFolderName(suffix: string): string {
    return `${Directory.GATEWAY_FOLDER_PREFIX}${web3Utils.toChecksumAddress(suffix)}`;
  }
}
