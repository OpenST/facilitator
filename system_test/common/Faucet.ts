import axios, { AxiosResponse, AxiosError } from 'axios';
import Mosaic from 'Mosaic';
import { TransactionObject } from 'Mosaic/dist/interacts/types';
import Web3 from 'web3';
import { Account } from 'web3-eth-accounts';
import BigNumber from 'bignumber.js';
import AddressHandler from './AddressHandler';
import Utils from './Utils';
import Logger from '../../src/common/Logger';
/**
 * Class contain methods for faucet operation.
 */
export default class Faucet {
  /**
   * Returns remaining OST fund to faucet.
   * @param accounts List of accounts.
   * @param web3 Web3 instance.
   */
  public static async refundOSTToFaucet(accounts: Account[], web3: Web3): Promise<void> {
    const config = await Utils.getConfig();
    const { valueToken, faucet } = config.chains.origin;
    accounts.map(async (account: Account): Promise<void> => {
      const balance = await AddressHandler.getTokenBalance(account.address, web3, valueToken);
      const valueTokenInstance = Mosaic.interacts.getERC20I(web3, valueToken);
      Logger.info(`Approving faucet ${faucet} by ${account.address} for amount ${balance.toString(10)}`);
      const approveRawTx = valueTokenInstance.methods.approve(
        faucet,
        balance.toString(10),
      );
      await Utils.sendTransaction(approveRawTx, {
        from: account.address,
      });
      const txObject: TransactionObject<boolean> = valueTokenInstance.methods.transfer(
        faucet,
        balance.toString(10),
      );
      await Utils.sendTransaction(txObject, {
        from: account.address,
        gasPrice: '0x3B9ACA00',
      });
      Logger.info(`Refund successful to ${faucet} from ${account.address}`);
    });
  }

  /**
   * This method funds OST on origin and auxiliary chain.
   * @param accounts List of accounts.
   * @param chain Chain identifier.
   * @param web3 Web3 instance.
   */
  public static async fundAccounts(accounts: Account[], chain: number, web3: Web3): Promise<void> {
    const fundingPromises = accounts.map(async (account: Account): Promise<void> => {
      const config = await Utils.getConfig();
      const { valueToken } = config.chains.origin;
      const balance = await AddressHandler.getTokenBalance(
        account.address,
        web3,
        valueToken,
      );
      if (balance.lt(new BigNumber(250))) {
        await this.fundFromFaucet(account.address, chain);
        Logger.info('Waiting for funding to finish');
        await new Promise(done => setTimeout(done, 40000));
        Logger.info('Funding finished');
      }
    });
    await Promise.all(fundingPromises);
  }

  /**
   * This method makes the funding request to faucet.
   * @param beneficiary Address of beneficiary.
   * @param chain Chain identifier.
   */
  private static async fundFromFaucet(beneficiary: string, chain: number): Promise<void> {
    Logger.info(`✅ Funding ${beneficiary} for chain ${chain}`);
    const FAUCET_URL = 'https://faucet.mosaicdao.org';
    return axios.post(
      FAUCET_URL,
      {
        beneficiary: `${beneficiary}@${chain}`,
      },
      {
        method: 'post',
      },
    ).then(async (response: AxiosResponse): Promise<void> => {
      Logger.info(`Transaction hash is ${response.data.txHash}`);
    }).catch((error: AxiosError): void => {
      Logger.info('error from axios catch : ', error.stack);
    });
  }
}
