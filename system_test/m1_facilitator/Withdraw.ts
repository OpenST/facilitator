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

    // check that valuetoken => utilitytoken
    // wait
    
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
      await Utils.addAccountsToWeb3Wallet(testWithdrawerAccounts, auxiliaryWeb3);
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
          console.log('before sending withdrawal transaction');
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
      const accounts = Array.from(finalMetachainAccountBalances.keys());

      for (let j = 0; j < accounts.length; j += 1) {
        // const initialBalance = initialAuxiliaryAccountBalance[accounts[j]].toString(10);
        const finalBalance = finalMetachainAccountBalances.get(accounts[j]);
        const expectedBalance = expectedAuxiliaryAccountBalance[accounts[j]];

        assert.strictEqual(
          // @ts-ignore
          expectedBalance.eq(finalBalance),
          true,
          `Expected balance for address ${accounts[j]} is ${expectedBalance} but got ${finalBalance}`,
        );
      }

      Logger.info('Final balances captured');

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

      const finalOriginAccountBalances = await Utils.getAccountBalances(testWithdrawerAccounts, originWeb3, valueToken);

      for (let m = 0; m < accounts.length; m += 1) {
        const initialBalance = new BigNumber(initialOriginAccountBalance[accounts[m]]);
        // @ts-ignore
        const finalBalance = new BigNumber(finalOriginAccountBalances.get(accounts[m]));

        assert.strictEqual(
          finalBalance.gte(initialBalance),
          true,
          `Expected balance for address ${accounts[m]} must be greater than ${finalBalance}`,
        );
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

    const intentHash = await erc20Cogateway.methods.hashWithdrawIntent(
      valueToken,
      utilityToken,
      testAmount.toString(10),
      account.address,
    ).call();
    const nonce = await erc20Cogateway.methods.nonces(account.address).call();
    console.log('Withdraw -> nonce', nonce);
    const messageHash = await erc20Cogateway.methods.outboxMessageHash(
      intentHash,
      '0',
      testGasprice.toString(10),
      testGasLimit.toString(10),
      account.address,
    ).call();

    console.log('message hash : ', messageHash);

    console.log('outbox status ', await erc20Cogateway.methods.outbox(messageHash).call());

    const utilityTokenInstance = Mosaic.interacts.getUtilityToken(auxiliaryWeb3, utilityToken);
    console.log(`balance of withdrawer ${account.address}`, await utilityTokenInstance.methods.balanceOf(account.address).call());
    const rawTx = utilityTokenInstance.methods.approve(
      erc20CogatewayAddress,
      testAmount.toString(10),
    );

    await Utils.sendTransaction(
      rawTx,
      {
        from: account.address,
      },
    );

    console.log('approval ', await utilityTokenInstance.methods.allowance(account.address, erc20CogatewayAddress).call());
    console.log('valuetoken in utility token : ', await utilityTokenInstance.methods.valueToken().call());
    // console.log('list of unloced wallteds ', );
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
