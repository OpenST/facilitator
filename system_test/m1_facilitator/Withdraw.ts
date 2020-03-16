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

import { Account } from 'web3-eth-accounts';
import Mosaic from 'Mosaic';
import Web3 from 'web3';

import config from './config';
import AddressHandler from '../common/AddressHandler';
import Faucet from '../common/Faucet';
import Utils from '../common/Utils';

export default class Withdraw {
  public static async withdrawSystemTest(): Promise<void> {
    const {
      withdrawerCount,
      concurrencyCount,
      iterations,
      pollingInterval,
      timeoutInterval,
    } = config.testData.withdraw;
    const originWsEndpoint = config.chains.origin.wsEndpoint;
    const auxiliaryWsEndpoint = config.chains.auxiliary.wsEndpoint;
    const auxiliaryChainId = config.chains.auxiliary.chainId;

    const testDataObject = {};
    interface Balance {
      [key: string]: number;
    }
    const initialOriginAccountBalance: Balance = {};
    const expectedOriginAccountBalance: Balance = {};
    const initialAuxiliaryAccountBalance: Balance = {};
    const finalOriginAccountBalance: Balance = {};

    let testWithdrawerAccounts = [];
    let totalUniqueDepositorAccounts = [];

    for (let i = 0; i < iterations; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testWithdrawerAccounts = await AddressHandler.getRandomAddresses(
        withdrawerCount,
        concurrencyCount,
      );

      // eslint-disable-next-line no-await-in-loop
      await Faucet.fundAccounts(testWithdrawerAccounts, auxiliaryChainId);

      const initialBalancePromises = testWithdrawerAccounts.map(
        async (account: Account): Promise<void> => {
          const { valueToken } = config.chains.origin;
          const { utilityToken } = config.chains.auxiliary;

          const originBalance = await AddressHandler.getOriginTokenBalance(
            account.address,
            originWsEndpoint,
            valueToken,
          );
          initialOriginAccountBalance[account.address] = originBalance;

          const auxiliaryBalance = await AddressHandler.getAuxiliaryTokenBalance(
            account.address,
            auxiliaryWsEndpoint,
            utilityToken,
          );
          initialAuxiliaryAccountBalance[account.address] = auxiliaryBalance;
        },
      );
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(initialBalancePromises);

      const withdrawTransactionPromises = testWithdrawerAccounts.map(
        async (account: Account): Promise<void> => {
          const { txObject, withdrawAmount } = await this.createWithdrawTransactionObject(account);
          if (expectedOriginAccountBalance[account.address]) {
            expectedOriginAccountBalance[account.address] += withdrawAmount;
          } else {
            expectedOriginAccountBalance[account.address] = withdrawAmount;
          }
          // TODO: what should be the gasPrice?
          const txReceipt = await txObject.send({
            from: account.address,
            gasPrice: '0x3B9ACA00',
            gas: (await txObject.estimateGas({ from: account.address })),
          });

          const {
            amount,
            nonce,
            beneficiary,
            feeGasPrice,
            feeGasLimit,
            withdrawer,
            utilityToken,
            messageHash,
          } = txReceipt.events.WithdrawIntentDeclared.returnValues;

          if (!testDataObject[i]) {
            testDataObject[i] = [];
          }

          testDataObject[i].push({
            amount,
            nonce,
            beneficiary,
            feeGasPrice,
            feeGasLimit,
            withdrawer,
            utilityToken,
            messageHash,
          });
        },
      );
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(withdrawTransactionPromises);
      // eslint-disable-next-line no-await-in-loop
      await new Promise(done => setTimeout(done, pollingInterval));

      const uniqueAddresses = testWithdrawerAccounts.filter(
        async (item, index, ar): Promise<boolean> => ar.indexOf(item) === index,
      );
      totalUniqueDepositorAccounts = totalUniqueDepositorAccounts.concat(uniqueAddresses);
    }

    await new Promise(done => setTimeout(done, timeoutInterval));

    const finalOriginBalancePromises = testWithdrawerAccounts.map(
      async (account: Account): Promise<void> => {
        const { valueToken } = config.chains.origin;
        const originBalance = await AddressHandler.getOriginTokenBalance(
          account.address,
          originWsEndpoint,
          valueToken,
        );
        finalOriginAccountBalance[account.address] = originBalance;
      },
    );
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(finalOriginBalancePromises);

    // TODO: generate report

    // TODO: refund to faucet
  }

  private static async createWithdrawTransactionObject(account: Account): Promise<any> {
    const erc20CogatewayAddress = config.chains.auxiliary.cogateway;
    const auxiliaryWeb3 = new Web3(config.chains.auxiliary.wsEndpoint);
    const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(auxiliaryWeb3, erc20CogatewayAddress);

    const { minAmount } = config.testData.withdraw;
    const { maxAmount } = config.testData.withdraw;
    const testAmount = await Utils.getRandomNumber(minAmount, maxAmount);

    const { minGasPrice } = config.testData.withdraw;
    const { maxGasPrice } = config.testData.withdraw;
    const testGasprice = await Utils.getRandomNumber(minGasPrice, maxGasPrice);

    const { minGasLimit } = config.testData.withdraw;
    const { maxGasLimit } = config.testData.withdraw;
    const testGasLimit = await Utils.getRandomNumber(minGasLimit, maxGasLimit);

    const { utilityToken } = config.chains.auxiliary;

    return {
      txObject: erc20Cogateway.methods.withdraw(
        testAmount,
        account.address,
        testGasprice,
        testGasLimit,
        utilityToken,
      ),
      withdrawAmount: testAmount,
    };
  }
}
