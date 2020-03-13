import Mosaic from 'Mosaic';
import Web3 from 'web3';

import config from './config';
import AddressHandler from '../common/AddressHandler';
import Faucet from '../common/Faucet';
import Utils from '../common/Utils';

export default class Withdraw {
  public static async withdrawSystemTest(): Promise<void> {
    const { withdrawerCount } = config.testData.withdraw;
    const { concurrencyCount } = config.testData.withdraw;
    const { iterations } = config.testData.withdraw;
    const { pollingInterval } = config.testData.withdraw;
    const { timeoutInterval } = config.testData.withdraw;
    const originWsEndpoint = config.chains.origin.wsEndpoint;
    const auxiliaryWsEndpoint = config.chains.auxiliary.wsEndpoint;
    const auxiliaryChainId = config.chains.auxiliary.chainId;

    const testDataObject = {};
    const initialOriginAccountBalance = {};
    const expectedOriginAccountBalance = {};
    const initialAuxiliaryAccountBalance = {};
    const finalOriginAccountBalance = {};

    let testWithdrawerAccounts = [];

    for(let i = 0; i < iterations; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testWithdrawerAccounts = await AddressHandler.getRandomAddresses(
        withdrawerCount,
        concurrencyCount,
      );

      // eslint-disable-next-line no-await-in-loop
      await Faucet.fundAccounts(testWithdrawerAccounts, auxiliaryChainId);

      const initialBalancePromises = testWithdrawerAccounts.map(
        async (account: any): Promise<void> => {
          const originBalance = await AddressHandler.getBalance(
            account.address,
            originWsEndpoint,
          );
          initialOriginAccountBalance[account.address] = originBalance;

          const auxiliaryBalance = await AddressHandler.getBalance(
            account.address,
            auxiliaryWsEndpoint,
          );
          initialAuxiliaryAccountBalance[account.address] = auxiliaryBalance;
        },
      );
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(initialBalancePromises);

      const withdrawTransactionPromises = testWithdrawerAccounts.map(
        async (account: any): Promise<void> => {
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

          if(!testDataObject[i]) {
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
        }
      );
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(withdrawTransactionPromises);
      // eslint-disable-next-line no-await-in-loop
      await new Promise(done => setTimeout(done, pollingInterval));
    }

    await new Promise(done => setTimeout(done, timeoutInterval));

    const finalOriginBalancePromises = testWithdrawerAccounts.map(
      async (account: any): Promise<void> => {
        const originBalance = await AddressHandler.getBalance(
          account.address,
          originWsEndpoint,
        );
        finalOriginAccountBalance[account.address] = originBalance;
      },
    );
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(finalOriginBalancePromises);

    // TODO: generate report
  }

  private static async createWithdrawTransactionObject(account: any): Promise<any> {
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
    const testGasLimit = await Utils.getRandomNumber(minGasPrice, maxGasPrice);

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
