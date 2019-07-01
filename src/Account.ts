'use strict';

import Logger from './Logger';

/**
 * It provides methods to create, encrypt and unlock accounts.
 */
export default class Account {
  /**
   * Constructor
   * @param address Public address of the account.
   * @param encryptedKeyStore Encrypted keystore data for the account.
   */
  constructor(
    readonly address: string,
    readonly encryptedKeyStore: object,
  ) {}

  /**
   * It creates new account and encrypts it with input password.
   * @param {Web3} web3 The web3 instance.
   * @param password The password required to unlock the account.
   * @returns {Account} Account object.
   */
  public static create(web3: any, password: string): Account {
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
  // public unlock(web3: Web3, password: string): boolean {
  //   // Unlocking the account and adding it to the local web3 instance so that everything is signed
  //   // locally when using web3.eth.send
  //   return false;
  // }
}
