// Copyright 2020 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// import { Account } from 'web3-eth-accounts';
import Mosaic from 'Mosaic';
import Web3 from 'web3';

import AddressHandler from '../common/AddressHandler';
import Faucet from '../common/Faucet';
import Utils from '../common/Utils';
// import UtilsIntegration from '../../test_integration/m1_facilitator/utils';

interface Balance {
  [key: string]: string;
}

export default class Deposit {
  public static async depositSystemTest(): Promise<void> {
    const config = await Utils.getConfig();
    const {
      concurrencyCount,
      iterations,
      // pollingInterval,
      // timeoutInterval,
    } = config.testData.deposit;
    const originWsEndpoint = config.chains.origin.wsEndpoint;
    const auxiliaryWsEndpoint = config.chains.auxiliary.wsEndpoint;
    const originChainId = config.chains.origin.chainId;

    const originWeb3 = new Web3(originWsEndpoint);
    originWeb3.transactionConfirmationBlocks = 1;
    const auxiliaryWeb3 = new Web3(auxiliaryWsEndpoint);

    let depositMessageHash: string;
    const messageHashes: string[] = [];

    const initialOriginAccountBalance: Balance = {};
    const finalOriginAccountBalance: Balance = {};
    const expectedOriginAccountBalance: Balance = {};
    const initialAuxiliaryAccountBalance: Balance = {};

    let testDepositorAccounts = [];

    const { valueToken } = config.chains.origin;

    for (let i = 0; i < iterations; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testDepositorAccounts = await AddressHandler.getAddresses(concurrencyCount, originWeb3);

      // eslint-disable-next-line no-await-in-loop
      await Utils.addAccountsToWeb3Wallet(testDepositorAccounts, originWeb3);

      // eslint-disable-next-line no-await-in-loop
      await Faucet.fundAccounts(testDepositorAccounts, originChainId, originWeb3);

      const initialOriginAccountBalancePromises = testDepositorAccounts.map(
        async (account: any): Promise<void> => {
          const originBalance = await AddressHandler.getTokenBalance(
            account.address,
            originWeb3,
            valueToken,
          );
          initialOriginAccountBalance[account.address] = originBalance.toString(10);
        },
      );

      const initialAuxiliaryAccountBalancePromises = testDepositorAccounts.map(
        async (account: any): Promise<void> => {
          const erc20CogatewayAddress = config.chains.auxiliary.cogateway;
          const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(
            auxiliaryWeb3,
            erc20CogatewayAddress,
          );

          const utilityTokenAddress = erc20Cogateway.methods.utilityTokens(valueToken).call();
          const auxiliaryBalance = await AddressHandler.getTokenBalance(
            account.address,
            auxiliaryWeb3,
            utilityTokenAddress,
          );
          initialAuxiliaryAccountBalance[account.address] = auxiliaryBalance;
        },
      );

      const depositTransactionPromises = testDepositorAccounts.map(
        // eslint-disable-next-line no-loop-func
        async (account: any): Promise<void> => {
          originWeb3.transactionConfirmationBlocks = 1;
          const { txObject, depositAmount } = await this.createDepositTransactionObject(
            account,
            originWeb3,
          );
          if (expectedOriginAccountBalance[account.address]) {
            expectedOriginAccountBalance[account.address] += depositAmount;
          } else {
            expectedOriginAccountBalance[account.address] = depositAmount;
          }
          const txReceipt = await Utils.sendTransaction(txObject, {
            from: account.address,
          });
          // @ts-ignore
          depositMessageHash = txReceipt.events.DepositIntentDeclared.returnValues.messageHash;
          // console.log('deposit txReceipt:-', txReceipt);
          messageHashes.push(depositMessageHash);
        },
      );
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(depositTransactionPromises);
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(initialOriginAccountBalancePromises);
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(initialAuxiliaryAccountBalancePromises);

      // final origin balances
      const finalOriginAccountBalancePromises = testDepositorAccounts.map(
        async (account: any): Promise<void> => {
          const originBalance = await AddressHandler.getTokenBalance(
            account.address,
            originWeb3,
            valueToken,
          );
          finalOriginAccountBalance[account.address] = originBalance.toString(10);
        },
      );

      // eslint-disable-next-line no-await-in-loop
      await Promise.all(finalOriginAccountBalancePromises);
      console.log('Initial Origin account token balances :-', initialOriginAccountBalance);
      console.log('Fianl Origin account token balances', finalOriginAccountBalance);
    }
  }

  private static async createDepositTransactionObject(account: any, web3: any): Promise<any> {
    const config = await Utils.getConfig();

    const erc20GatewayAddress = config.chains.origin.gateway;
    const erc20Gateway = Mosaic.interacts.getERC20Gateway(web3, erc20GatewayAddress);

    const { minAmount } = config.testData.deposit;
    const { maxAmount } = config.testData.deposit;
    const testAmount = await Utils.getRandomNumber(minAmount, maxAmount);

    const { minGasPrice } = config.testData.deposit;
    const { maxGasPrice } = config.testData.deposit;
    const testGasPrice = await Utils.getRandomNumber(minGasPrice, maxGasPrice);

    const { minGasLimit } = config.testData.deposit;
    const { maxGasLimit } = config.testData.deposit;
    const testGasLimit = await Utils.getRandomNumber(minGasLimit, maxGasLimit);

    const { valueToken } = config.chains.origin;
    const valueTokenInstance = Mosaic.interacts.getERC20I(web3, valueToken);

    const approveRawTx = valueTokenInstance.methods.approve(
      erc20GatewayAddress,
      testAmount,
    );

    await Utils.sendTransaction(approveRawTx, {
      from: account.address,
    });
    console.log('testAmount :-', testAmount);

    return {
      txObject: erc20Gateway.methods.deposit(
        testAmount,
        account.address,
        testGasPrice,
        testGasLimit,
        valueToken,
      ),
      depositAmount: testAmount,
    };
  }
}
