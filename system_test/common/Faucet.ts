import axios from 'axios';
import Mosaic from 'Mosaic';
import Web3 from 'web3';

import Tx from 'ethereumjs-tx';

import AddressHandler from './AddressHandler';
import config from '../m1_facilitator/config';

export default class Faucet {
  public static async refundOSTToFaucet(accounts: any[]): Promise<void> {
    accounts.map(async (account: any): Promise<void> => {
      const { valueToken, wsEndpoint, faucet } = config.chains.origin;

      const balance = await AddressHandler.getOriginTokenBalance(account, wsEndpoint, valueToken);
      const web3 = new Web3(wsEndpoint);
      const valueTokenInstance = Mosaic.interacts.getERC20I(web3, valueToken);

      const txObject = valueTokenInstance.methods.transfer(faucet, balance);
      await txObject.send({
        from: account.address,
        gasPrice: '0x3B9ACA00',
        gas: (await txObject.estimateGas({ from: account.address })),
      });
    });
  }

  public static async refundGasTOFaucet(accounts: any[]): Promise<void> {
    accounts.map(async (account: any): Promise<void> => {
      const { wsEndpoint, faucet } = config.chains.auxiliary;
      const balance = await AddressHandler.getBalance(account, wsEndpoint);
      const web3 = new Web3(wsEndpoint);

      const rawTransaction = {
        from: account.address,
        to: faucet,
        value: balance,
        nonce: web3.eth.getTransactionCount(account.address),
        gasPrice: 0x3B9ACA00,
        gas: 23000,
        chainId: config.chains.auxiliary.chainId,
      };

      const { privateKey } = account;
      // eslint-disable-next-line no-buffer-constructor
      const privateKeyHex = new Buffer(privateKey, 'hex');
      const tx = new Tx(rawTransaction);
      tx.sign(privateKeyHex);
      const serializedTx = tx.serialize();
      await web3.eth.sendTransaction(serializedTx);
    });
  }

  public static async fundAccounts(accounts: any[], chain: number): Promise<void> {
    accounts.map(async (account: any): Promise<void> => {
      await this.fundFromFaucet(account.address, chain);
    });
  }

  private static async fundFromFaucet(beneficiary: string, chain: number): Promise<void> {
    try {
      console.log(`Funding ${beneficiary} for chain ${chain}`);
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
