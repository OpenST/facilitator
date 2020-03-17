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
import Logger from '../../src/common/Logger';

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

    const messageHashes: string[] = [];
    interface Balance {
      [key: string]: number;
    }

    const initialAuxiliaryAccountBalance: Balance = {};
    const expectedAuxiliaryAccountBalance: Balance = {};
    const initialOriginAccountBalance: Balance = {};
    const finalOriginAccountBalance: Balance = {};

    let testWithdrawerAccounts = [];
    let totalWithdrawerAccounts = [];

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

          const auxiliaryBalance = await AddressHandler.getAuxiliaryTokenBalance(
            account.address,
            auxiliaryWsEndpoint,
            utilityToken,
          );
          initialAuxiliaryAccountBalance[account.address] = auxiliaryBalance;

          const originBalance = await AddressHandler.getOriginTokenBalance(
            account.address,
            originWsEndpoint,
            valueToken,
          );
          initialOriginAccountBalance[account.address] = originBalance;
        },
      );
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(initialBalancePromises);

      const withdrawTransactionPromises = testWithdrawerAccounts.map(
        async (account: Account): Promise<void> => {
          const { txObject, withdrawAmount } = await this.createWithdrawTransactionObject(account);
          if (expectedAuxiliaryAccountBalance[account.address]) {
            expectedAuxiliaryAccountBalance[account.address] += withdrawAmount;
          } else {
            expectedAuxiliaryAccountBalance[account.address] = withdrawAmount;
          }
          // TODO: what should be the gasPrice?
          const txReceipt = await txObject.send({
            from: account.address,
            gasPrice: '0x3B9ACA00',
            gas: (await txObject.estimateGas({ from: account.address })),
          });

          const {
            messageHash,
          } = txReceipt.events.WithdrawIntentDeclared.returnValues;

          messageHashes.push(messageHash);
        },
      );
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(withdrawTransactionPromises);
      // eslint-disable-next-line no-await-in-loop
      await new Promise(done => setTimeout(done, pollingInterval));

      totalWithdrawerAccounts = totalWithdrawerAccounts.concat(testWithdrawerAccounts);
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

    Withdraw.generateReport(
      initialAuxiliaryAccountBalance,
      expectedAuxiliaryAccountBalance,
      initialOriginAccountBalance,
      finalOriginAccountBalance,
      testWithdrawerAccounts,
      messageHashes,
    );

    const totalUniqueWithdrawerAccounts = totalWithdrawerAccounts.filter(
      async (item, index, ar): Promise<boolean> => ar.indexOf(item) === index,
    );

    await Faucet.refundGasTOFaucet(totalUniqueWithdrawerAccounts);
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

  private static async generateReport(
    initialAuxiliaryAccountBalance: any,
    expectedAuxiliaryAccountBalance: any,
    initialOriginAccountBalance: any,
    finalOriginAccountBalance: any,
    testWithdrawerAccounts: Account[],
    messageHashes: string[],
  ): Promise<void> {
    const { utilityToken } = config.chains.auxiliary;
    const auxiliaryWsEndpoint = config.chains.auxiliary.wsEndpoint;

    Logger.info('Withdraw flow');
    Logger.info('\t\t Metachain \t\t');
    Logger.info('Address \t Balance Before Withdraw \t Balance After Withdraw \t Expected Balance Change \t Actual Balance Change \t Success(T/F)');
    testWithdrawerAccounts.map(
      async (account: Account): Promise<void> => {
        const balanceBeforeWithdraw = initialAuxiliaryAccountBalance[account.address];
        const balanceAfterWithdraw = await AddressHandler.getAuxiliaryTokenBalance(
          account.address,
          auxiliaryWsEndpoint,
          utilityToken,
        );

        const expectedBalanceChange = expectedAuxiliaryAccountBalance[account.address];
        const actualBalanceChange = balanceAfterWithdraw - balanceBeforeWithdraw;
        const success = (expectedBalanceChange === actualBalanceChange);

        Logger.info(`${account.address} \t ${balanceBeforeWithdraw} \t ${balanceAfterWithdraw} \t ${expectedBalanceChange} \t ${actualBalanceChange} \t ${success}`);
      },
    );

    Logger.info('\t\t Origin \t\t');
    Logger.info('Address \t Balance Before Withdraw \t Balance After Withdraw \t Expected Balance Change \t Actual Balance Change \t Success(T/F)');

    const { valueToken } = config.chains.origin;
    const originWsEndpoint = config.chains.origin.wsEndpoint;
    testWithdrawerAccounts.map(
      async (account: Account): Promise<void> => {
        const balanceBeforeConfirmWithdraw = initialOriginAccountBalance[account.address];
        const balanceAfterConfirmWithdraw = await AddressHandler.getOriginTokenBalance(
          account.address,
          originWsEndpoint,
          valueToken,
        );

        const expectedBalanceChange = finalOriginAccountBalance[account.address] - initialOriginAccountBalance[account.address];
        const actualBalanceChange = balanceAfterConfirmWithdraw - balanceBeforeConfirmWithdraw;
        const success = (expectedBalanceChange === actualBalanceChange);
        Logger.info(`${account.address} \t ${balanceBeforeConfirmWithdraw} \t ${balanceAfterConfirmWithdraw} \t ${expectedBalanceChange} \t ${actualBalanceChange} \t ${success}`);
      },
    );

    // TO DO: message status report
    const erc20CogatewayAddress = config.chains.auxiliary.cogateway;
    const auxiliaryWeb3 = new Web3(auxiliaryWsEndpoint);
    const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(auxiliaryWeb3, erc20CogatewayAddress);

    Logger.info('MessageHash \t Success');
    messageHashes.map(
      async (messageHash: string): Promise<void> => {
        // To check that messageHash exists in the outbox mapping.
        const messageStatus = erc20Cogateway.methods.outbox.call(messageHash);
        Logger.info(`${messageHash} \t ${messageStatus}`);
      },
    );
  }
}
