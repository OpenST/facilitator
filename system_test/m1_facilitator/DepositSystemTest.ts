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
import Mosaic from 'Mosaic';
import Web3 from 'web3';
import { Account } from 'web3-eth-accounts';

import BigNumber from 'bignumber.js';
import { resolve } from 'bluebird';
import AddressHandler from '../common/AddressHandler';
import Faucet from '../common/Faucet';
import Logger from '../../src/common/Logger';
import Utils from '../common/Utils';

import utils from '../../test_integration/m1_facilitator/utils';

/**
 * Logic for deposit system tests.
 */
export default class DepositSystemTest {
  /**
   * This method runs the deposit system tests.
   */
  public static async run(): Promise<void> {
    Logger.info('Starting deposit system test');
    const config = await Utils.getConfig();
    const {
      concurrencyCount,
      iterations,
    } = config.testConfig.deposit;
    const originChainId = config.chains.origin.chainId;

    const originWeb3 = new Web3(config.chains.origin.wsEndpoint);
    originWeb3.transactionConfirmationBlocks = 1;
    const auxiliaryWeb3 = new Web3(config.chains.auxiliary.wsEndpoint);
    auxiliaryWeb3.transactionConfirmationBlocks = 1;

    const expectedOriginAccountBalance: Map<string, BigNumber> = new Map<string, BigNumber>();
    const messageHashes: string[] = [];

    let depositorAccounts: Account[] = [];

    const { valueToken } = config.chains.origin;

    for (let i = 0; i < iterations; i += 1) {
      Logger.info(`Deposit iteration ${i}`);

      depositorAccounts = await AddressHandler.getAddresses(concurrencyCount, originWeb3);
      Utils.addAccountsToWeb3Wallet(depositorAccounts, originWeb3);
      Logger.info('Funding deposit accounts with OST on value chain');
      await Faucet.fundAccounts(depositorAccounts, originChainId, originWeb3);

      Logger.info('Getting initial origin account balances');
      const initialOriginAccountBalance: Map<string, BigNumber> = await Utils.getAccountBalances(
        depositorAccounts,
        originWeb3,
        valueToken,
      );
      const erc20CogatewayAddress = config.chains.auxiliary.cogateway;
      const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(
        auxiliaryWeb3,
        erc20CogatewayAddress,
      );
      const utilityTokenAddress = await erc20Cogateway.methods.utilityTokens(valueToken).call();

      const initialAuxiliaryAccountBalance: Map<string, BigNumber> = await Utils.getAccountBalances(
        depositorAccounts,
        auxiliaryWeb3,
        utilityTokenAddress,
      );
      const depositMessageHashes = await this.deposit(
        depositorAccounts,
        originWeb3,
        expectedOriginAccountBalance,
        initialOriginAccountBalance,
      );

      messageHashes.push(...depositMessageHashes);

      // final origin balances
      Logger.info('Getting final account balances on origin');

      const finalOriginAccountBalance: Map<string, BigNumber> = await Utils.getAccountBalances(
        depositorAccounts,
        originWeb3,
        valueToken,
      );
      Logger.info('Final balances captured');

      // Assert for final origin balance should be equal to expected origin balance.
      const accounts = Array.from(finalOriginAccountBalance.keys());
      for (let j = 0; j < accounts.length; j += 1) {
        // @ts-ignore
        const initialBalance = initialOriginAccountBalance.get(accounts[j]).toString(10);
        // @ts-ignore
        const finalBalance = finalOriginAccountBalance.get(accounts[j]).toString(10);
        // @ts-ignore
        const expectedBalance = expectedOriginAccountBalance.get(accounts[j]).toString(10);
        assert.equal(
          // @ts-ignore
          finalOriginAccountBalance.get(accounts[j]).eq(expectedOriginAccountBalance!.get(accounts[j])),
          true,
          // @ts-ignore
          `Final and expected balance must match.
            initial balance: ${initialBalance}
            final balance: ${finalBalance}
            expected balance: ${expectedBalance}`,
        );
      }

      // wait for facilitator to finish the job
      await utils.waitForCondition(
        async (): Promise<boolean> => {
          for (let j = 0; j < messageHashes.length; j += 1) {
            const isDeclared = await erc20Cogateway.methods.inbox(messageHashes[j]).call();
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

      const finalAuxiliaryAccountBalance: Map<string, BigNumber> = await Utils.getAccountBalances(
        depositorAccounts,
        auxiliaryWeb3,
        utilityTokenAddress,
      );


      // assert balance on utility token
      // Note: the check must be changed to "greater than" only while
      //       running the complete system test. As the utilityToken is not available
      for (let j = 0; j < accounts.length; j += 1) {
        // @ts-ignore
        const initialBalance = initialAuxiliaryAccountBalance.get(accounts[j]);
        // // @ts-ignore
        const finalBalance = finalAuxiliaryAccountBalance.get(accounts[j]);
        assert.ok(
          // @ts-ignore
          finalBalance.gte(initialBalance),
          `Final auxiliary balances must be grater than the initial auxiliary balances.
            initial auxiliary balance ${initialBalance}
            final auxiliary balance ${finalBalance}`,
        );
      }
      // TO DO: send report
      console.log('initial origin account balances:   ', initialOriginAccountBalance);
      console.log('initialAuxiliaryAccountBalance  ', initialAuxiliaryAccountBalance);
      console.log('finalOriginAccountBalance  ', finalOriginAccountBalance);
      console.log('finalOriginAccountBalance  ', finalAuxiliaryAccountBalance);

      await this.generateReport(
        initialOriginAccountBalance,
        finalOriginAccountBalance,
        expectedOriginAccountBalance,
        accounts,
        messageHashes,
        auxiliaryWeb3,
      );
    }
    await Faucet.refundOSTToFaucet(depositorAccounts, originWeb3);
    resolve();
  }

  /**
   * Perform bulk deposit
   * @param depositorAccounts
   * @param originWeb3
   * @param expectedOriginAccountBalance
   * @param initialOriginAccountBalance
   */
  private static async deposit(
    depositorAccounts: Account[],
    originWeb3: Web3,
    expectedOriginAccountBalance: Map<string, BigNumber>,
    initialOriginAccountBalance: Map<string, BigNumber>,
  ): Promise<string[]> {
    const depositPromises = depositorAccounts.map(
      async (account: Account): Promise<string> => {
        const { txObject, depositAmount } = await DepositSystemTest.createDepositTransactionObject(
          account,
          originWeb3,
        );
        if (
          !expectedOriginAccountBalance.get(account.address)
          && initialOriginAccountBalance.get(account.address)
        ) {
          expectedOriginAccountBalance.set(
            account.address,
            // @ts-ignore
            initialOriginAccountBalance.get(account.address),
          );
        }
        // Subtract deposit amount from initial balance.
        expectedOriginAccountBalance.set(
          account.address,
          // @ts-ignore
          expectedOriginAccountBalance.get(account.address).minus(depositAmount),
        );

        Logger.debug(`Expected value token balance for ${account.address} is ${expectedOriginAccountBalance.get(account.address)}`);
        Logger.info(`Sending deposit transaction request for ${account.address}`);
        const txReceipt = await Utils.sendTransaction(txObject, {
          from: account.address,
        });

        Logger.debug(`Deposit transaction done ${txReceipt.transactionHash}`);
        // @ts-ignore
        const depositMessageHash = txReceipt.events.DepositIntentDeclared.returnValues.messageHash;
        Logger.info(`Deposit message hash ${depositMessageHash} for account ${account.address}`);
        return depositMessageHash;
      },
    );

    const messageHashes = await Promise.all(depositPromises);

    return messageHashes;
  }

  /**
   * Creates transaction object.
   * @param account
   * @param web3
   */
  private static async createDepositTransactionObject(account: Account, web3: Web3): Promise<any> {
    Logger.info(`Generating deposit transaction object for ${account.address}`);
    const config = await Utils.getConfig();

    const erc20GatewayAddress = config.chains.origin.gateway;
    const erc20Gateway = Mosaic.interacts.getERC20Gateway(web3, erc20GatewayAddress);

    const {
      minAmount,
      maxAmount,
      minGasPrice,
      maxGasPrice,
      minGasLimit,
      maxGasLimit,
    } = config.testConfig.deposit;
    const testAmount = await Utils.getRandomNumber(minAmount, maxAmount);

    const testGasPrice = await Utils.getRandomNumber(minGasPrice, maxGasPrice);
    const testGasLimit = await Utils.getRandomNumber(minGasLimit, maxGasLimit);

    const { valueToken } = config.chains.origin;
    const valueTokenInstance = Mosaic.interacts.getERC20I(web3, valueToken);

    const approveRawTx = valueTokenInstance.methods.approve(
      erc20GatewayAddress,
      testAmount.toString(10),
    );

    await Utils.sendTransaction(approveRawTx, {
      from: account.address,
    });
    Logger.info(`Approved successfully by ${account.address} for amount ${testAmount}`);

    return {
      txObject: erc20Gateway.methods.deposit(
        testAmount.toString(10),
        account.address,
        testGasPrice.toString(10),
        testGasLimit.toString(10),
        valueToken,
      ),
      depositAmount: testAmount,
    };
  }

  private static async generateReport(
    initialOriginAccountBalance: Map<string, BigNumber>,
    finalOriginAccountBalance: Map<string, BigNumber>,
    expectedOriginAccountBalance: Map<string, BigNumber>,
    accounts: string[],
    depositMessageHashes: string[],
    auxiliaryWeb3: Web3,
  ): Promise<void> {
    Logger.info('\t\t Balance Report (Deposit flow) \t\t');
    Logger.info('\t\t Origin \t\t');
    Logger.info('Address \t Balance Before Deposit \t Expected Balance After Deposit \t Actual Balance After Deposit \t Success(T/F)');

    for (let i = 0; i < accounts.length; i += 1) {
      // @ts-ignore
      const initialBalance = initialOriginAccountBalance.get(accounts[i]).toString(10);
      // @ts-ignore
      const expectedBalance = expectedOriginAccountBalance.get(accounts[i]).toString(10);
      // @ts-ignore
      const finalBalance = finalOriginAccountBalance.get(accounts[i]).toString(10);
      const success = finalBalance === expectedBalance;

      Logger.info(`${accounts[i]} \t ${initialBalance} \t ${expectedBalance} \t ${finalBalance} \t ${success}`);
    }

    Logger.info('\t\t MessageHash Report \t\t');

    const config = await Utils.getConfig();
    const erc20CogatewayAddress = config.chains.auxiliary.cogateway;
    const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(
      auxiliaryWeb3,
      erc20CogatewayAddress,
    );

    Logger.info('MessageHash \t\t Success(T/F)');
    for (let i = 0; i < depositMessageHashes.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const success = await erc20Cogateway.methods.inbox(depositMessageHashes[i]).call();
      Logger.info(`${depositMessageHashes[i]} \t\t ${success}`);
    }
  }
}
