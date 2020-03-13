import { Account } from 'web3-eth-accounts';

import Mosaic from 'Mosaic';
import Utils from './Utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

export default class AddressHandler {
  private static async generateAddresses(count: number): Promise<Account[]> {
    const web3 = new Web3();
    const generatedAddresses = [];
    for (let i = 0; i < count; i += 1) {
      generatedAddresses.push(web3.eth.accounts.create(web3.utils.randomHex(8)));
    }
    return generatedAddresses;
  }

  public static async getRandomAddresses(
    totalAccountCount: number,
    concurrencyCount: number,
  ): Promise<Account[]> {
    const generatedAddresses = await this.generateAddresses(totalAccountCount);

    const randomAddresses = [];
    for (let i = 0; i < concurrencyCount; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const index = await Utils.getRandomNumber(0, totalAccountCount - 1);
      randomAddresses.push(generatedAddresses[index]);
    }
    return randomAddresses;
  }

  public static async getBalance(account: string, wsEndpoint: string): Promise<number> {
    const web3 = new Web3(wsEndpoint);
    const balance = await web3.eth.getBalance(account);

    return balance;
  }

  public static async getOriginTokenBalance(
    account: string,
    wsEndpoint: string,
    valueToken: string,
  ): Promise<number> {
    const originWeb3 = new Web3(wsEndpoint);
    const valueTokenInstance = Mosaic.interacts.getERC20I(originWeb3, valueToken);
    const balance = await valueTokenInstance.methods.balanceOf(account).call();

    return +balance;
  }

  public static async getAuxiliaryTokenBalance(
    account: string,
    wsEndpoint: string,
    utilityToken: string,
  ): Promise<number> {
    const auxiliaryWeb3 = new Web3(wsEndpoint);
    const utilityTokenInstance = Mosaic.interacts.getERC20I(auxiliaryWeb3, utilityToken);
    const balance = await utilityTokenInstance.methods.balanceOf(account).call();

    return +balance;
  }
}
