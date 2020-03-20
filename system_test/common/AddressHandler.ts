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

import Utils from './Utils';

export default class AddressHandler {
  public static async validateAddresses(addresses: string[]): Promise<boolean> {
    const filePath = 'system_test/m1_facilitator/accounts';
    return addresses.filter(
      (address): boolean => fs.existsSync(path.join(filePath, '/', `${address}.json`)),
    ).length > 0;
  }

  public static async getRandomAddresses(
    totalAccountCount: number,
    concurrencyCount: number,
    web3: any,
  ): Promise<any[]> {
    const config = await Utils.getConfig();
    const configAddresses = config.accounts;
    const randomAddresses = [];

    if (AddressHandler.validateAddresses(configAddresses)) {
      for (let i = 0; i < concurrencyCount; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const index = await Utils.getRandomNumber(0, totalAccountCount - 1);
        const accountAddress = configAddresses[index];
        const keyStore = fs.readFileSync(`system_test/m1_facilitator/accounts/${accountAddress}.json`);
        const password = fs.readFileSync(`system_test/m1_facilitator/accounts/${accountAddress}.password`);

        const accountKeyStore = JSON.parse(keyStore.toString());
        const accountPassword = JSON.parse(password.toString());

        const decryptedAccount = web3.eth.accounts.decrypt(accountKeyStore, accountPassword);
        randomAddresses.push(decryptedAccount);
      }
    }
    return randomAddresses;
  }

  public static async getBalance(account: string, web3: any): Promise<number> {
    const balance = await web3.eth.getBalance(account);
    return balance;
  }

  public static async getTokenBalance(
    account: string,
    web3: any,
    tokenAddress: string,
  ): Promise<number> {
    const tokenInstance = Mosaic.interacts.getERC20I(web3, tokenAddress);
    const balance = await tokenInstance.methods.balanceOf(account).call();

    return +balance;
  }

  public static async getAddresses(count: number, web3: any): Promise<any[]> {
    const config = await Utils.getConfig();
    const configAddresses = config.accounts;
    const accountsSelected: any[] = [];

    for (let i = 0; i < count; i += 1) {
      const accountAddress = configAddresses[i];
      const keyStore = fs.readFileSync(`system_test/m1_facilitator/accounts/${accountAddress}.json`);
      const password = fs.readFileSync(`system_test/m1_facilitator/accounts/${accountAddress}.password`);

      const accountKeyStore = JSON.parse(keyStore.toString());
      const accountPassword = JSON.parse(password.toString());

      const decryptedAccount = web3.eth.accounts.decrypt(accountKeyStore, accountPassword);
      accountsSelected.push(decryptedAccount);
    }
    return accountsSelected;
  }
}
