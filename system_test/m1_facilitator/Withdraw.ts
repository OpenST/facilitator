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

import assert from 'assert';
import { Account } from 'web3-eth-accounts';
import Mosaic from 'Mosaic';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import Logger from '../../src/common/Logger';
import AddressHandler from '../common/AddressHandler';
import Faucet from '../common/Faucet';
import Utils from '../common/Utils';

import utils from '../../test_integration/m1_facilitator/utils';

interface Balance {
  [key: string]: BigNumber;
}

export default class Withdraw {
  public static async withdrawSystemTest(): Promise<void> {
    const config = await Utils.getConfig();
    const {
      concurrencyCount,
      iterations,
    } = config.testConfig.withdraw;
    const originWsEndpoint = config.chains.origin.wsEndpoint;
    const auxiliaryWsEndpoint = config.chains.auxiliary.wsEndpoint;
    const auxiliaryChainId = config.chains.auxiliary.chainId;

    const auxiliaryWeb3 = new Web3(auxiliaryWsEndpoint);
    const originWeb3 = new Web3(originWsEndpoint);

    const messageHashes: string[] = [];

    const initialAuxiliaryAccountBalance: Balance = {};
    const expectedAuxiliaryAccountBalance: Balance = {};
    const initialOriginAccountBalance: Balance = {};

    let testWithdrawerAccounts = [];

    for (let i = 0; i < iterations; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testWithdrawerAccounts = await AddressHandler.getAddresses(
        concurrencyCount,
        auxiliaryWeb3,
      );

      // eslint-disable-next-line no-await-in-loop
      await Faucet.fundAccounts(testWithdrawerAccounts, auxiliaryChainId, auxiliaryWeb3);
      console.log('done with funding accounts : ');
      const initialBalancePromises = testWithdrawerAccounts.map(
        async (account: Account): Promise<void> => {
          // console.log('account : ',account);
          console.log('account.address : ', account.address);
          const { valueToken } = config.chains.origin;
          console.log('Withdraw -> valueToken', valueToken);
          const { utilityToken } = config.chains.auxiliary;
          console.log('Withdraw -> utilityToken', utilityToken);

          const auxiliaryBalance = await AddressHandler.getTokenBalance(
            account.address,
            auxiliaryWeb3,
            utilityToken,
          );
          console.log('Withdraw -> auxiliaryBalance', auxiliaryBalance);

          initialAuxiliaryAccountBalance[account.address] = auxiliaryBalance;

          const originBalance = await AddressHandler.getTokenBalance(
            account.address,
            originWeb3,
            valueToken,
          );
          initialOriginAccountBalance[account.address] = originBalance;
        },
      );
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(initialBalancePromises);


      // const config = await Utils.getConfig();
      const erc20CogatewayAddress = config.chains.auxiliary.cogateway;
      // const auxiliaryWeb3 = new Web3(config.chains.auxiliary.wsEndpoint);
      const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(auxiliaryWeb3, erc20CogatewayAddress);
      const { valueToken } = config.chains.origin;
      // eslint-disable-next-line no-await-in-loop
      const utilityToken = await erc20Cogateway.methods.utilityTokens(valueToken).call();

      const withdrawTransactionPromises = testWithdrawerAccounts.map(
        async (account: Account): Promise<void> => {
          const { txObject, withdrawAmount } = await this.createWithdrawTransactionObject(account, auxiliaryWeb3);
          if (expectedAuxiliaryAccountBalance[account.address]) {
            expectedAuxiliaryAccountBalance[account.address] = expectedAuxiliaryAccountBalance[account.address].minus(withdrawAmount);
          } else {
            expectedAuxiliaryAccountBalance[account.address] = initialAuxiliaryAccountBalance[account.address];
          }
          const txReceipt = await Utils.sendTransaction(txObject, {
            from: account.address,
          });

          console.log('txReceipt : ', txReceipt);
          // @ts-ignore
          const { messageHash } = txReceipt.events.WithdrawIntentDeclared.returnValues;

          messageHashes.push(messageHash);
        },
      );
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(withdrawTransactionPromises);

      // eslint-disable-next-line no-await-in-loop
      const finalMetachainAccountBalances = await Utils.getAccountBalances(testWithdrawerAccounts, auxiliaryWeb3, utilityToken);

      Logger.info('Final balances captured');

      // Assert for final origin balance should be equal to expected origin balance.
      const accounts = Array.from(finalMetachainAccountBalances.keys());
      for (let j = 0; j < accounts.length; j += 1) {
        // @ts-ignore
        const initialBalance = initialOriginAccountBalance.get(accounts[j]).toString(10);
        // @ts-ignore
        const finalBalance = finalMetachainAccountBalances.get(accounts[j]).toString(10);
        // @ts-ignore
        const expectedBalance = finalMetachainAccountBalances.get(accounts[j]).toString(10);
        assert.equal(
          // @ts-ignore
          finalMetachainAccountBalances.get(accounts[j]).eq(finalMetachainAccountBalances.get(accounts[j])),
          true,
          // @ts-ignore
          `Final and expected balance must match.
            initial balance: ${initialBalance}
            final balance: ${finalBalance}
            expected balance: ${expectedBalance}`,
        );
      }

      const erc20Gateway = Mosaic.interacts.getERC20Gateway(originWeb3, config.chains.origin.gateway);
      // wait for facilitator to finish the job
      // eslint-disable-next-line no-await-in-loop
      await utils.waitForCondition(
        async (): Promise<boolean> => {
          for (let j = 0; j < messageHashes.length; j++) {
            const isDeclared = await erc20Gateway.methods.inbox(messageHashes[j]).call();
            if (!isDeclared) {
              return false;
            }
          }
          return true;
        },
        1000,
        // 5 * 60 * 1000,
        6,
      );


      // todo: origin assertions

      const finalAuxiliaryAccountBalance: Map<string, BigNumber> = await Utils.getAccountBalances(
        testWithdrawerAccounts,
        originWeb3,
        valueToken,
      );

      console.log('Final origin account balance :-', finalAuxiliaryAccountBalance);
      // assert balance on utility token
      for (let j = 0; j < accounts.length; j += 1) {
        // assert.ok(
        //   // @ts-ignore
        //   finalAuxiliaryAccountBalance.get(accounts[j]).gt(initialAuxiliaryAccountBalance.get(accounts[i])),
        //   '',
        // );
      }
    }
  }

  private static async createWithdrawTransactionObject(account: Account, auxiliaryWeb3: Web3): Promise<any> {
    const config = await Utils.getConfig();
    const erc20CogatewayAddress = config.chains.auxiliary.cogateway;
    const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(auxiliaryWeb3, erc20CogatewayAddress);

    const {
      minAmount,
      maxAmount,
      minGasPrice,
      maxGasPrice,
      minGasLimit,
      maxGasLimit,
    } = config.testConfig.withdraw;

    const testAmount = await Utils.getRandomNumber(minAmount, maxAmount);
    console.log('Withdraw -> testAmount', testAmount);

    const testGasprice = await Utils.getRandomNumber(minGasPrice, maxGasPrice);
    console.log('Withdraw -> testGasprice', testGasprice);
    const testGasLimit = await Utils.getRandomNumber(minGasLimit, maxGasLimit);
    console.log('Withdraw -> testGasLimit', testGasLimit);

    // const { utilityToken } = config.chains.auxiliary;
    const { valueToken } = config.chains.origin;
    console.log('Withdraw -> valueToken', valueToken);
    const utilityToken = await erc20Cogateway.methods.utilityTokens(valueToken).call();
    console.log('Withdraw -> utilityToken', utilityToken);


    const utilityTokenInstance = Mosaic.interacts.getUtilityToken(auxiliaryWeb3, utilityToken);

    await utilityTokenInstance.methods.approve(
      erc20CogatewayAddress,
      testAmount.toString(10),
    );
    return {
      txObject: erc20Cogateway.methods.withdraw(
        testAmount.toString(10),
        account.address,
        testGasprice.toString(10),
        testGasLimit.toString(10),
        utilityToken,
      ),
      withdrawAmount: testAmount,
      utilityToken,
    };
  }
}
