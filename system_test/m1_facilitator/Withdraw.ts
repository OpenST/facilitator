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

import AddressHandler from '../common/AddressHandler';
import Faucet from '../common/Faucet';
import Utils from '../common/Utils';

interface Balance {
  [key: string]: number;
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

      const initialBalancePromises = testWithdrawerAccounts.map(
        async (account: Account): Promise<void> => {
          const { valueToken } = config.chains.origin;
          const { utilityToken } = config.chains.auxiliary;

          const auxiliaryBalance = await AddressHandler.getTokenBalance(
            account.address,
            auxiliaryWsEndpoint,
            utilityToken,
          );
          initialAuxiliaryAccountBalance[account.address] = auxiliaryBalance;

          const originBalance = await AddressHandler.getTokenBalance(
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
          const txReceipt = await Utils.sendTransaction(txObject, {
            from: account.address,
          });

          // @ts-ignore
          const {
            messageHash,
          } = txReceipt.events.WithdrawIntentDeclared.returnValues;

          messageHashes.push(messageHash);
        },
      );
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(withdrawTransactionPromises);
    }
  }

  private static async createWithdrawTransactionObject(account: Account): Promise<any> {
    const config = await Utils.getConfig();
    const erc20CogatewayAddress = config.chains.auxiliary.cogateway;
    const auxiliaryWeb3 = new Web3(config.chains.auxiliary.wsEndpoint);
    const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(auxiliaryWeb3, erc20CogatewayAddress);

    const {
      minAmount,
      maxAmount,
      minGasPrice,
      maxGasPrice,
      minGasLimit,
      maxGasLimit
    } = config.testConfig.withdraw;

    const testAmount = await Utils.getRandomNumber(minAmount, maxAmount);

    const testGasprice = await Utils.getRandomNumber(minGasPrice, maxGasPrice);
    const testGasLimit = await Utils.getRandomNumber(minGasLimit, maxGasLimit);

    const { utilityToken } = config.chains.auxiliary;

    await utilityToken.methods.approve(
      erc20CogatewayAddress,
      testAmount,
    );
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
