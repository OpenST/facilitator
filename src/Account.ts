'use strict';

import Logger from './Logger';

/**
 * Manages encrypted Web3 accounts.
 */
export class Account {

  /**
   * Creates a new account and encrypts it.
   * @param {string} chain Chain identifier to read and write the accounts file.
   */
  static create(web3, password) {
    const account = Account._newWeb3Account(web3);
    const encryptedAccount = Account._encrypt(account, web3, password);

    return { account, encryptedAccount };
    Logger.info(`created account ${account.address}`);
  }

  /**
   * Creates a new account using Web3.
   * @private
   * @returns {Object} A Web3 account object.
   */
  static _newWeb3Account(web3) {
    const account = web3.eth.accounts.create();

    return account;
  }

  /**
   * Encrypts the given account with a password.
   * @private
   * @param {Object} account A Web3 account object.
   * @returns {Object} A Web3 keyStore object.
   */
  static _encrypt(account, web3, password) {
    const encrypted = web3.eth.accounts.encrypt(account.privateKey.toString(), password);
    return encrypted;
  }
}
