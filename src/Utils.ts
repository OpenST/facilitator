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
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import * as utils from 'web3-utils';
import Logger from './Logger';
import Account from './Account';

const Utils = {
  /**
   * Get config json data from the given file path.
   * @param filePath Config file path.
   * @returns JSON data from config file.
   */
  getJsonDataFromPath(filePath: string): Record<string, any> {
    if (fs.existsSync(filePath)) {
      const config = fs.readFileSync(filePath).toString();
      if (config && config.length > 0) {
        return JSON.parse(config);
      }
      throw new Error('Empty file.');
    }
    throw new Error('File not found.');
  },

  /**
   * This method submits a raw transaction and returns transaction hash.
   * @param tx Raw transaction.
   * @param txOption Transaction options.
   * @param web3 The web3 instance to be used for fetching nonce.
   */
  async sendTransaction(tx: any, txOption: any, web3: Web3): Promise<string> {
    return new Promise(async (onResolve, onReject): Promise<void> => {
      const txOptions = Object.assign({}, txOption);
      Logger.debug(`Transaction sender ${txOptions.from}`);
      if (txOptions.gas === undefined) {
        Logger.debug('Estimating gas for the transaction');
        txOptions.gas = await tx.estimateGas(txOptions).catch((e: Error) => {
          Logger.error('Error on estimating gas, using default value  ', e);
          return 6000000;
        });
        Logger.debug(`Transaction gas estimates  ${txOptions.gas}`);
      }
      if (txOptions.nonce === undefined) {
        const account: Account = new Account(txOptions.from);
        txOptions.nonce = await account.getNonce(web3);
        Logger.debug(`Nonce to be used for transaction sender: ${txOptions.from} is ${txOptions.nonce}`);
      }
      tx.send(txOptions)
        .on('transactionHash', (hash: string): void => onResolve(hash))
        .on('error', (error: Error): void => onReject(error));
    });
  },

  getDefinedOwnProps(obj: {}): string[] {
    const nonUndefinedOwnedProps: string[] = [];
    Object.entries(obj).forEach(
      ([key, value]): void => {
        if (value !== undefined) {
          nonUndefinedOwnedProps.push(key);
        }
      },
    );
    return nonUndefinedOwnedProps;
  },

  /**
   * @return Current timestamp as BigNumber object.
   */
  getCurrentTimestamp(): BigNumber {
    const currentTimestampInMs = new Date().getTime();
    const currentTimestampInS = Math.round(currentTimestampInMs / 1000);
    return new BigNumber(currentTimestampInS);
  },

  /**
   * It provides checksum address using web3.
   * @param address Address.
   * @returns It returns checksum address.
   */
  toChecksumAddress(address: string): string {
    return utils.toChecksumAddress(address);
  },
};

export default Utils;
