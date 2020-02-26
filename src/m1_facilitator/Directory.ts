// Copyright 2020 OpenST Ltd.
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

import path from 'path';
import os from 'os';

/**
 * Provide method to calculate folder and file path.
 */
export default class Directory {
  /**
   * Returns mosaic folder path
   */
  public static getMosaicPath() {
    return path.join(
      os.homedir(),
      '.mosaic',
    );
  }

  /**
   * Returns path of facilitator database file.
   * @param architectureLayout Architecture layout
   * @param gatewayAddresses Address of gateway contract.
   */
  public static getFacilitatorDatabaseFile(
    architectureLayout: string,
    gatewayAddresses: string,
  ) {
    return path.join(
      Directory.getMosaicPath(),
      architectureLayout,
      `${gatewayAddresses}.db`,
    );
  }
}
