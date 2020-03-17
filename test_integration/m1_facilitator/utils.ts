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

import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';

export default class Utils {
  /**
   *
   * @param web3 Web3 instance.
   * @param contractABI ABI of contract.
   * @param bin Bin of contract.
   * @param args Contract constructor arguments.
   * @param deployer Deployer address.
   */
  public static async deploy(
    web3: Web3,
    contractABI: AbiItem[],
    bin: string,
    args: string[],
    deployer: string,
  ): Promise<Contract> {
    const deploymentTransaction = new web3.eth.Contract(
      contractABI,
    ).deploy({
      arguments: args,
      data: bin,
    });

    const options = {
      gas: await deploymentTransaction.estimateGas({ from: deployer }),
      gasPrice: '0x01',
      from: deployer,
    };
    return deploymentTransaction.send(options);
  }

  /**
   * Send Transaction.
   * @param rawTx Raw Transaction object.
   * @param txOptions Transaction Options.
   */
  public static async sendTransaction(
    rawTx: any,
    txOptions: {
      gas?: string;
      gasPrice?: string;
      from: string;
    },
  ): Promise<any> {
    const calculatedTransactionOptions = {
      ...txOptions,
      gas: (await rawTx.estimateGas({ from: txOptions.from })).toString(),
      gasPrice: txOptions.gasPrice? txOptions.gasPrice: '0x01',
    };
    //console.log(`${calculatedTransactionOptions} Send transaction data receipt`);
    return rawTx.send(calculatedTransactionOptions);
  }

  /**
   * This function accepts a function which returns a boolean value when resolves. This function
   * keep evaluating boolean function till boolean function returns `true` or
   * timeout happens.
   * @param boolFunction A function which returns boolean value.
   * @param intervalTime Interval after which boolean function is evaluated.
   * @param maxInterval Maximum number of attempts.
   */
  public static async waitForCondition(
    boolFunction: Function,
    intervalTime: number = 2000,
    maxInterval: number = 100,
  ): Promise<void> {
    return new Promise((resolve) => {
      let count = 0;
      const timer = setInterval(async (): Promise<void> => {
        count += 1;
        const isTrue = await boolFunction();
        if (isTrue || count > maxInterval) {
          clearInterval(timer);
          resolve();
        }
      }, intervalTime);
    });
  }
}
