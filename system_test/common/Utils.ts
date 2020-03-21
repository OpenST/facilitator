import { TransactionReceipt } from 'web3-core';
import { Account } from 'web3-eth-accounts';
import fs from 'fs';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import Logger from '../../src/common/Logger';
import AddressHandler from './AddressHandler';


const CONFIG_PATH = 'system_test/m1_facilitator/config.json';

export default class Utils {
  public static async getRandomNumber(min: number, max: number): Promise<BigNumber> {
    return new BigNumber(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  public static async sendTransaction(tx: any, txOption: any): Promise<TransactionReceipt> {
    const txOptions = Object.assign({}, txOption);
    console.log('txOption : ', txOption);
    if (txOptions.gas === undefined) {
      txOptions.gas = await tx.estimateGas(txOptions);
    }

    return new Promise(async (onResolve, onReject): Promise<void> => {
      tx.send(txOptions)
        .on('transactionHash', async (hash: string): Promise<any> => Logger.debug(`submitted txHash: ${hash}`))
        .on('receipt', (receipt: TransactionReceipt): void => onResolve(receipt))
        .on('error', (error: Error): void => onReject(error));
    });
  }

  /**
   * Reads and return config.
   */
  public static async getConfig(): Promise<any> {
    const configFile = fs.readFileSync(CONFIG_PATH);
    return JSON.parse(configFile.toString());
  }

  public static async addAccountsToWeb3Wallet(accounts: any[], web3: any): Promise<void> {
    accounts.map(
      async (account: any): Promise<void> => {
        await web3.eth.accounts.wallet.add(account);
      },
    );
  }

  public static async getAccountBalances(accounts: Account[], web3: Web3, tokenAddress: string): Promise<Map<string, BigNumber>> {
    const accountBalances: Map<string, BigNumber> = new Map<string, BigNumber>();
    const balancePromises = accounts.map(
      async (account: Account): Promise<void> => {
        const originBalance = await AddressHandler.getTokenBalance(
          account.address,
          web3,
          tokenAddress,
        );

        const balance = new BigNumber(originBalance);
        Logger.debug(`Token: ${tokenAddress}  Account: ${account.address} Balance: ${balance.toString(10)}`);
        accountBalances.set(account.address, balance);
      },
    );
    await Promise.all(balancePromises);
    return accountBalances;
  }
}
