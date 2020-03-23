/* eslint-disable no-await-in-loop */
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
import { TransactionObject } from 'Mosaic/dist/interacts/types';
import { ERC20Gateway } from 'Mosaic/dist/interacts/ERC20Gateway';
import Logger from '../../src/common/Logger';
import AddressHandler from '../common/AddressHandler';
import Faucet from '../common/Faucet';
import Utils from '../common/Utils';

import utils from '../../test_integration/m1_facilitator/utils';

const POLLING_INTERVAL_TIME = 1000 * 60;
const MAX_RETRY_NUMBER = 5 * 1000;

/**
 * Logic for Withdrawal integration tests.
 */
export default class WithdrawSystemTest {
  /**
   * Start of Withdrawal integration tests.
   */
  public static async run(): Promise<void> {
    Logger.info('Starting withdrawal system test');
    const config = await Utils.getConfig();
    const erc20CogatewayAddress = config.chains.auxiliary.cogateway;
    const auxiliaryWsEndpoint = config.chains.auxiliary.wsEndpoint;
    const auxiliaryChainId = config.chains.auxiliary.chainId;

    const auxiliaryWeb3 = new Web3(auxiliaryWsEndpoint);

    const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(auxiliaryWeb3, erc20CogatewayAddress);

    const {
      concurrencyCount,
      iterations,
    } = config.testConfig.withdraw;
    const originWsEndpoint = config.chains.origin.wsEndpoint;
    const originWeb3 = new Web3(originWsEndpoint);

    const messageHashes: string[] = [];

    const initialAuxiliaryAccountBalance: Map<string, BigNumber> = new Map<string, BigNumber>();
    const expectedAuxiliaryAccountBalance: Map<string, BigNumber> = new Map<string, BigNumber>();
    const initialOriginAccountBalance: Map<string, BigNumber> = new Map<string, BigNumber>();

    let testWithdrawerAccounts = [];

    for (let i = 0; i < iterations; i += 1) {
      Logger.info(`Starting of withdrawal iteration ${i + 1}`);
      testWithdrawerAccounts = await AddressHandler.getWithdrawAddress(
        concurrencyCount,
        auxiliaryWeb3,
      );

      Utils.addAccountsToWeb3Wallet(testWithdrawerAccounts, auxiliaryWeb3);
      await Faucet.fundAccounts(testWithdrawerAccounts, auxiliaryChainId, auxiliaryWeb3);

      const initialBalancePromises = testWithdrawerAccounts.map(
        async (account: Account): Promise<void> => {
          const { valueToken } = config.chains.origin;
          const { utilityToken } = config.chains.auxiliary;

          const auxiliaryBalance = await AddressHandler.getTokenBalance(
            account.address,
            auxiliaryWeb3,
            utilityToken,
          );

          initialAuxiliaryAccountBalance.set(account.address, auxiliaryBalance);

          const originBalance = await AddressHandler.getTokenBalance(
            account.address,
            originWeb3,
            valueToken,
          );
          initialOriginAccountBalance.set(account.address, originBalance);
        },
      );
      await Promise.all(initialBalancePromises);

      const { valueToken } = config.chains.origin;
      const utilityToken = await erc20Cogateway.methods.utilityTokens(valueToken).call();

      const withdrawTransactionPromises = testWithdrawerAccounts.map(
        async (account: Account): Promise<void> => {
          const { txObject, withdrawAmount } = await this.createWithdrawTransactionObject(
            account.address,
            auxiliaryWeb3,
          );
          if (expectedAuxiliaryAccountBalance.get(account.address)) {
            expectedAuxiliaryAccountBalance.set(
              account.address,
              expectedAuxiliaryAccountBalance.get(account.address)!.minus(withdrawAmount),
            );
          } else {
            expectedAuxiliaryAccountBalance.set(
              account.address,
              initialAuxiliaryAccountBalance.get(account.address)!.minus(withdrawAmount),
            );
          }
          Logger.info(`sending withdrawal transaction for ${account.address}`);
          const txReceipt = await Utils.sendTransaction(txObject, {
            from: account.address,
          });

          // @ts-ignore
          const { messageHash } = txReceipt.events.WithdrawIntentDeclared.returnValues;

          messageHashes.push(messageHash);
        },
      );

      await Promise.all(withdrawTransactionPromises);

      const finalMetachainAccountBalances = await Utils.getAccountBalances(
        testWithdrawerAccounts,
        auxiliaryWeb3,
        utilityToken,
      );
      const accounts = Array.from(finalMetachainAccountBalances.keys());

      for (let j = 0; j < accounts.length; j += 1) {
        const finalBalance = finalMetachainAccountBalances.get(accounts[j]);
        const expectedBalance = expectedAuxiliaryAccountBalance.get(accounts[j]);

        assert.strictEqual(
          // @ts-ignore
          expectedBalance.eq(finalBalance),
          true,
          `Expected balance for address ${accounts[j]} is ${expectedBalance} but got ${finalBalance}`,
        );
      }

      Logger.info('Final balances captured for withdrawal');

      const erc20Gateway = Mosaic.interacts.getERC20Gateway(
        originWeb3,
        config.chains.origin.gateway,
      );

      await utils.waitForCondition(
        async (): Promise<boolean> => {
          for (let j = 0; j < messageHashes.length; j += 1) {
            const isDeclared = await erc20Gateway.methods.inbox(messageHashes[j]).call();
            Logger.debug(`Message status on origin chain is ${isDeclared} `
             + `for message hash ${messageHashes[j]}`);
            if (!isDeclared) {
              return false;
            }
          }
          return true;
        },
        POLLING_INTERVAL_TIME, // poll in 60 sec
        MAX_RETRY_NUMBER, //  max retry 5000
      );

      const finalOriginAccountBalances = await Utils.getAccountBalances(
        testWithdrawerAccounts,
        originWeb3,
        valueToken,
      );

      for (let m = 0; m < accounts.length; m += 1) {
        const initialBalance = new BigNumber(initialOriginAccountBalance.get(accounts[m])!);
        // @ts-ignore
        const finalBalance = new BigNumber(finalOriginAccountBalances.get(accounts[m]));
        assert.strictEqual(
          finalBalance.gte(initialBalance),
          true,
          `Expected balance for address ${accounts[m]} must be greater than ${finalBalance}`,
        );
      }

      await this.generateReport(
        initialAuxiliaryAccountBalance,
        finalMetachainAccountBalances,
        expectedAuxiliaryAccountBalance,
        accounts,
        messageHashes,
        erc20Gateway,
      );
      Logger.info('Completed all the iterations for withdraw');
    }
    return Promise.resolve();
  }

  /**
   * It creates withdrawal transaction object.
   *
   * @param account Withdrawer address.
   * @param auxiliaryWeb3 Auxiliary web3 object.
   */
  private static async createWithdrawTransactionObject(
    account: string,
    auxiliaryWeb3: Web3,
  ): Promise<{
      txObject: TransactionObject<string>;
      withdrawAmount: BigNumber;
      utilityToken: string;
    }> {
    Logger.info(`Withdrawal request from account ${account}`);
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
    Logger.info(`withdrawal amount is ${testAmount}`);

    const testGasprice = await Utils.getRandomNumber(minGasPrice, maxGasPrice);
    const testGasLimit = await Utils.getRandomNumber(minGasLimit, maxGasLimit);

    const { valueToken } = config.chains.origin;
    const utilityToken = await erc20Cogateway.methods.utilityTokens(valueToken).call();

    const utilityTokenInstance = Mosaic.interacts.getUtilityToken(auxiliaryWeb3, utilityToken);
    Logger.info(`utility token balance of withdrawer ${account} is `
      + `${await utilityTokenInstance.methods.balanceOf(account).call()}`);
    const rawTx = utilityTokenInstance.methods.approve(
      erc20CogatewayAddress,
      testAmount.toString(10),
    );

    await Utils.sendTransaction(
      rawTx,
      {
        from: account,
      },
    );

    return {
      txObject: erc20Cogateway.methods.withdraw(
        testAmount.toString(10),
        account,
        testGasprice.toString(10),
        testGasLimit.toString(10),
        utilityToken,
      ),
      withdrawAmount: testAmount,
      utilityToken,
    };
  }

  /**
   * Generation of reports after each iteration of withdrawal.
   *
   * @param initialMetachainAccountBalance Map of initial account balance at metachain.
   * @param finalMetachainAccountBalance Map of final account balance at metachain.
   * @param expectedMetachainAccountBalance Map of expected account balance at metachain.
   * @param accounts Array of accounts.
   * @param withdrawalMessageHashes Withdrawal message hashes.
   * @param erc20GatewayObject Instance of ERC20Gateway contract.
   */
  private static async generateReport(
    initialMetachainAccountBalance: Map<string, BigNumber>,
    finalMetachainAccountBalance: Map<string, BigNumber>,
    expectedMetachainAccountBalance: Map<string, BigNumber>,
    accounts: string[],
    withdrawalMessageHashes: string[],
    erc20GatewayObject: ERC20Gateway,
  ): Promise<void> {
    Logger.info('\t\t Balance Report (Withdraw flow) \t\t');
    Logger.info('\t\t Auxiliary \t\t\n');
    Logger.info('Address \t Balance Before Withdrawal \t Expected Balance After Withdrawal \t Actual Balance After Withdrawal \t Success(T/F)');

    for (let i = 0; i < accounts.length; i += 1) {
      // @ts-ignore
      const initialBalance = initialMetachainAccountBalance.get(accounts[i]).toString(10);
      // @ts-ignore
      const expectedBalance = expectedMetachainAccountBalance.get(accounts[i]).toString(10);
      // @ts-ignore
      const finalBalance = finalMetachainAccountBalance.get(accounts[i]).toString(10);
      const success = finalBalance === expectedBalance;

      Logger.info(`${accounts[i]} \t ${initialBalance} \t ${expectedBalance} \t ${finalBalance} \t ${success}`);
    }

    Logger.info('\t\t MessageHash Report \t\t');

    Logger.info('\n\n\nMessageHash \t\t Success(T/F)');
    for (let i = 0; i < withdrawalMessageHashes.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const success = await erc20GatewayObject.methods.inbox(withdrawalMessageHashes[i]).call();
      Logger.info(`${withdrawalMessageHashes[i]} \t\t ${success}`);
    }
  }
}
