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

import Web3 from 'web3';
import { EncryptedKeystoreV3Json, Account } from 'web3-eth-accounts';
import BigNumber from 'bignumber.js';
import Logger from '../../common/Logger';

/** This instance variable is used to persist nonce in-memory */
const addressNonceMap: Record<string, BigNumber> = {};

/**
 * It holds avatar account information.
 */
export default class AvatarAccount {
  public readonly address: string;

  private readonly keystore: EncryptedKeystoreV3Json;

  private readonly password: string;

  /**
   * Constructor.
   *
   * @param address Account address.
   * @param keystore Encrypted keystore.
   * @param password Keystore password.
   */
  private constructor(address: string, keystore: EncryptedKeystoreV3Json, password: string) {
    this.address = address;
    this.keystore = keystore;
    this.password = password;
  }

  /**
   * Unlocking the account and adding it to the local web3 instance.
   *
   * @param web3 Web3 provider instance.
   * @param encryptedKeystore Encrypted key store.
   * @param password Password of key store.
   */
  public static load(
    web3: Web3,
    encryptedKeystore: EncryptedKeystoreV3Json,
    password: string,
  ): AvatarAccount {
    let avatarAccount: AvatarAccount;
    try {
      const web3Account = web3.eth.accounts.decrypt(encryptedKeystore, password);
      web3.eth.accounts.wallet.add(web3Account);
      avatarAccount = new AvatarAccount(web3Account.address, encryptedKeystore, password);
    } catch (e) {
      Logger.error(`Loading of account failed. Message ${e.message}`);
      process.exit(1);
    }

    return avatarAccount;
  }

  /**
   * Gets the current nonce to send the next transaction with this account.
   * Tries to take pending transactions into account (not full proof).
   * Once the nonce is fetched from the node, it is cached and increased by 1 for every transaction.
   *
   * @param web3 Web3 provider instance.
   * @returns The nonce wrapped in a Promise.
   */
  public async getNonce(web3: Web3): Promise<BigNumber> {
    if (addressNonceMap[this.address]) {
      addressNonceMap[this.address] = addressNonceMap[this.address].plus(1);
    } else {
      const nonce = await web3.eth.getTransactionCount(this.address, 'pending');
      addressNonceMap[this.address] = new BigNumber(nonce);
    }
    return addressNonceMap[this.address];
  }
}
