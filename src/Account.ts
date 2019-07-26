import Web3 from 'web3';
import { EncryptedKeystoreV3Json } from 'web3-eth-accounts';
import BigNumber from 'bignumber.js';

import Logger from './Logger';

// This class variable would be used to persist nonce in-memory
const addressNonceMap: Record<string, BigNumber> = {};

/**
 * It provides methods to create, encrypt and unlock accounts.
 */
export default class Account {
  /* Storage */

  public readonly address: string;

  public readonly encryptedKeyStore?: EncryptedKeystoreV3Json;

  /**
   * Constructor
   * @param address Public address of the account.
   * @param encryptedKeyStore Encrypted keystore data for the account.
   */
  public constructor(
    address: string,
    encryptedKeyStore?: EncryptedKeystoreV3Json,
  ) {
    this.address = address;
    this.encryptedKeyStore = encryptedKeyStore;
  }

  /**
   * It creates new account and encrypts it with input password.
   *
   * @param web3 The web3 instance.
   * @param password The password required to unlock the account.
   *
   * @returns Account object.
   */
  public static create(web3: Web3, password: string): Account {
    const web3Account = web3.eth.accounts.create();
    const encryptedAccount = web3.eth.accounts.encrypt(
      web3Account.privateKey.toString(),
      password,
    );
    const account: Account = new Account(web3Account.address, encryptedAccount);

    Logger.info(`created account ${web3Account.address}`);
    return account;
  }

  /**
   * Unlocks account and keep it in memory unlocked.
   * @param web3 The web3 instance that this account uses.
   * @param password The password required to unlock the account.
   * @returns `true` if its unlocked otherwise false.
   */
  public unlock(web3: Web3, password: string): boolean {
    // Unlocking the account and adding it to the local web3 instance so that everything is signed
    // locally when using web3.eth.send
    try {
      const web3Account = web3.eth.accounts.decrypt(this.encryptedKeyStore!, password);
      web3.eth.accounts.wallet.add(web3Account);
      return true;
    } catch (e) {
      Logger.error(`unlock account failed: ${e.message}`);
      return false;
    }
  }

  /**
   * Get the current nonce to send the next transaction with this account.
   * Tries to take pending transactions into account (not full proof).
   * Once the nonce is fetched from the node, it is cached and increased by 1 for every transaction.
   * @returns The nonce wrapped in a Promise.
   */
  public async getNonce(web3: Web3): Promise<BigNumber> {
    if (addressNonceMap[this.address] !== undefined) {
      addressNonceMap[this.address] = addressNonceMap[this.address].add(1);
    } else {
      const nonce = await web3.eth.getTransactionCount(this.address, 'pending');
      addressNonceMap[this.address] = new BigNumber(nonce);
    }
    return addressNonceMap[this.address];
  }
}
