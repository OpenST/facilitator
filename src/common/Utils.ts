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

import * as Web3Utils from 'web3-utils';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';

/**
 * This class contains general purpose functions.
 */
export default class Utils {
  /**
   * Returns the checksum address.
   * @param address Ethereum Address.
   * @returns Checksum address.
   */
  public static toChecksumAddress(address: string): string {
    return Web3Utils.toChecksumAddress(address);
  }

  /**
   * Returns object after removing undefined properties.
   * @param obj Input object.
   */
  public static getDefinedOwnProps(obj: {}): string[] {
    const nonUndefinedOwnedProps: string[] = [];
    Object.entries(obj).forEach(
      ([key, value]): void => {
        if (value !== undefined) {
          nonUndefinedOwnedProps.push(key);
        }
      },
    );
    return nonUndefinedOwnedProps;
  }

  /**
   *  Returns the last block timestamp.
   */
  public static async latestBlockTimestamp(web3: Web3): Promise<BigNumber> {
    const block = await web3.eth.getBlock('latest');
    return new BigNumber(block.timestamp);
  }
}
