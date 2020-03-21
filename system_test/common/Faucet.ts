import axios, { AxiosResponse, AxiosError } from 'axios';
import Mosaic from 'Mosaic';
import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import Web3 from 'web3';
import { Account } from 'web3-eth-accounts';

import BigNumber from 'bignumber.js';
import AddressHandler from './AddressHandler';
import Utils from './Utils';

export default class Faucet {
  public static async refundOSTToFaucet(accounts: Account[]): Promise<void> {
    const config = await Utils.getConfig();
    accounts.map(async (account: Account): Promise<void> => {
      const { valueToken, wsEndpoint, faucet } = config.chains.origin;

      const balance = await AddressHandler.getTokenBalance(account.address, wsEndpoint, valueToken);
      const web3 = new Web3(wsEndpoint);
      const valueTokenInstance = Mosaic.interacts.getERC20I(web3, valueToken);

      const txObject: TransactionObject<boolean> = valueTokenInstance.methods.transfer(
        faucet,
        balance.toString(10),
      );
      await Utils.sendTransaction(txObject, {
        from: account.address,
        gasPrice: '0x3B9ACA00',
      });
    });
  }

  public static async refundGasToFaucet(accounts: Account[]): Promise<void> {
    const config = await Utils.getConfig();
    accounts.map(async (account: Account): Promise<void> => {
      const { wsEndpoint, faucet, chainId } = config.chains.auxiliary;
      const balance = await AddressHandler.getBalance(account.address, wsEndpoint);
      const web3 = new Web3(wsEndpoint);

      const gasPrice = new BigNumber('0x3B9ACA00');
      const transactionFee = new BigNumber(new BigNumber(2300).multipliedBy(gasPrice));

      const rawTransaction = {
        from: account.address,
        to: faucet,
        value: (balance.minus(transactionFee)).toString(10),
        gasPrice: gasPrice.toString(10),
        gas: web3.utils.toHex(23000),
        chainId,
      };
      await web3.eth.sendTransaction(rawTransaction);
    });
  }

  public static async fundAccounts(accounts: any[], chain: number, web3: any): Promise<void> {
    const fundingPromises = accounts.map(async (account: any): Promise<void> => {
      console.log('Account address for funding :-', account.address);
      const config = await Utils.getConfig();
      const { valueToken } = config.chains.origin;
      const balance = await AddressHandler.getTokenBalance(
        account.address,
        web3,
        valueToken,
      );
      if (balance.lt(new BigNumber(250))) {
        await this.fundFromFaucet(account.address, chain);
      }
    });
    await Promise.all(fundingPromises);
  }

  private static async fundFromFaucet(beneficiary: string, chain: number): Promise<void> {
    console.log(`✅Funding ${beneficiary} for chain ${chain}`);
    const FAUCET_URL = 'https://faucet.mosaicdao.org';

    await axios.post(
      FAUCET_URL,
      {
        beneficiary: `${beneficiary}@${chain}`,
      },
      // {
      //   method: 'post',
      // },
    ).then((response: AxiosResponse): void => {
      console.log(`Transaction hash is ${response.data.txHash}`);
    }).catch((error: AxiosError): void => {
      console.log('error from axios catch : ', error.stack);
    });
  }
}
