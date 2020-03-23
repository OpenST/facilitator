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

/* eslint-disable array-callback-return */
import Mosaic from 'Mosaic';
import fs from 'fs';
import path from 'path';
import { Account } from 'web3-eth-accounts';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import Utils from './Utils';

const KEYSTORE_FOLDER_PATH = 'system_test/m1_facilitator/accounts';

export default class AddressHandler {
  public static async validateAddresses(addresses: string[]): Promise<boolean> {
    const filePath = KEYSTORE_FOLDER_PATH;
    return addresses.filter(
      (address): boolean => fs.existsSync(path.join(filePath, '/', `${address}.json`)),
    ).length > 0;
  }

  public static async getBalance(account: string, web3: Web3): Promise<BigNumber> {
    const balance = await web3.eth.getBalance(account);
    return new BigNumber(balance);
  }

  public static async getTokenBalance(
    account: string,
    web3: Web3,
    tokenAddress: string,
  ): Promise<BigNumber> {
    const tokenInstance = Mosaic.interacts.getERC20I(web3, tokenAddress);
    const balance = await tokenInstance.methods.balanceOf(account).call();

    return new BigNumber(balance);
  }

  public static async getAddresses(count: number, web3: Web3): Promise<Account[]> {
    const config = await Utils.getConfig();
    const configAddresses = config.accounts;
    const accountsSelected: Account[] = [];

    if (AddressHandler.validateAddresses(configAddresses)) {
      for (let i = 0; i < count; i += 1) {
        const accountAddress = configAddresses[i];
        const keyStore = fs.readFileSync(this.keyStorePath(accountAddress));
        const password = fs.readFileSync(this.accountPasswordPath(accountAddress));

        const accountKeyStore = JSON.parse(keyStore.toString());
        const accountPassword = password.toString().trim();

        const decryptedAccount = web3.eth.accounts.decrypt(accountKeyStore, accountPassword);
        accountsSelected.push(decryptedAccount);
      }
    }
    return accountsSelected;
  }

  /**
   * Path of account password file.
   * @param accountAddress Account address.
   */
  private static accountPasswordPath(accountAddress: string): string {
    return `${KEYSTORE_FOLDER_PATH}/${accountAddress}.password`;
  }

  /**
   * Path of account keystore file.
   * @param accountAddress Account address.
   */
  private static keyStorePath(accountAddress: string): string {
    return `${KEYSTORE_FOLDER_PATH}/${accountAddress}.json`;
  }
}
