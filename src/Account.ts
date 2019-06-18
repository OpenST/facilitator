'use strict';

import { EncryptedKeystoreV3Json } from 'web3-eth-accounts';
import Logger from './Logger';

/**
 * Manages encrypted Web3 accounts.
 */
export default class Account {
  /**
   * Constructor
   * @param address Public address of the account.
   * @param encryptedKeyStore Encrypted keystore data for the account.
   */
  constructor(
    readonly address: string,
    readonly encryptedKeyStore: EncryptedKeystoreV3Json,
  ) { }

  /**
   * @param {Web3} web3 The web3 instance.
   * @param password The password required to unlock the account.
   * @returns {{account: Account; encryptedAccount: PrivateKey}}
   */
  public static create(web3: Web3, password: string): any {
    const account = Account.newWeb3Account(web3);
    const encryptedAccount = Account.encrypt(account, web3, password);
    Logger.info(`created account ${account.address}`);
    return { account, encryptedAccount };
  }

  /**
   * Creates a new account using Web3.
   * @private
   * @returns {Object} A Web3 account object.
   */
  private static newWeb3Account(web3) {
    const account = web3.eth.accounts.create();

    return account;
  }

  /**
   * Encrypts the given account with a password.
   * @private
   * @param {Object} account A Web3 account object.
   * @returns {Object} A Web3 keyStore object.
   */
  private static encrypt(account, web3, password) {
    const encrypted = web3.eth.accounts.encrypt(account.privateKey.toString(), password);
    return encrypted;
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
    return false;
  }
}

