import axios from 'axios';
import Mosaic from 'Mosaic';
import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
// import Tx from 'ethereumjs-tx';
import Web3 from 'web3';

import AddressHandler from './AddressHandler';
import Utils from './Utils';

export default class Faucet {
  public static async refundOSTToFaucet(accounts: any[]): Promise<void> {
    const config = await Utils.getConfig();
    accounts.map(async (account: any): Promise<void> => {
      const { valueToken, wsEndpoint, faucet } = config.chains.origin;

      const balance = await AddressHandler.getTokenBalance(account, wsEndpoint, valueToken);
      const web3 = new Web3(wsEndpoint);
      const valueTokenInstance = Mosaic.interacts.getERC20I(web3, valueToken);

      const txObject: TransactionObject<boolean> = valueTokenInstance.methods.transfer(
        faucet,
        balance,
      );
      await Utils.sendTransaction(txObject, {
        from: account.address,
        gasPrice: '0x3B9ACA00',
      });
    });
  }

  public static async refundGasToFaucet(accounts: any[]): Promise<void> {
    const config = await Utils.getConfig();
    accounts.map(async (account: any): Promise<void> => {
      const { wsEndpoint, faucet, chainId } = config.chains.auxiliary;
      const balance = await AddressHandler.getBalance(account, wsEndpoint);
      const web3 = new Web3(wsEndpoint);

      const rawTransaction = {
        from: account.address,
        to: faucet,
        value: balance,
        gasPrice: 0x3B9ACA00,
        gas: web3.utils.toHex(23000),
        chainId,
      };
      await web3.eth.sendTransaction(rawTransaction);
    });
  }

  public static async fundAccounts(accounts: any[], chain: number, originWeb3: any): Promise<void> {
    const fundingPromises = accounts.map(async (account: any): Promise<void> => {
      const config = await Utils.getConfig();
      const { valueToken } = config.chains.origin;
      const balance = await AddressHandler.getTokenBalance(
        account.address,
        originWeb3,
        valueToken,
      );
      if (balance < 250) {
        await this.fundFromFaucet(account.address, chain);
      }
    });
    await Promise.all(fundingPromises);
  }

  private static async fundFromFaucet(beneficiary: string, chain: number): Promise<void> {
    try {
      console.log(`✅Funding ${beneficiary} for chain ${chain}`);
      const FAUCET_URL = 'https://faucet.mosaicdao.org';

      const response = await axios.post(
        FAUCET_URL,
        {
          beneficiary: `${beneficiary}@${chain}`,
        },
      );
      console.log(`Transaction hash is ${response.data.txHash}`);
    } catch (error) {
      console.log(error.message);
    }
  }
}