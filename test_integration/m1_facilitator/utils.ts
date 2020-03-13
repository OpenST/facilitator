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

export default class Utils {
  /**
   *
   * @param web3
   * @param contractABI
   * @param bin
   * @param args
   * @param deployer
   */
  public static async deploy(
    web3: Web3,
    contractABI: AbiItem[],
    bin: string,
    args: string[],
    deployer: string,
  ) {
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
  ): Promise<string> {
    const calculatedTransactionOptions = {
      ...txOptions,
      gas: (await rawTx.estimateGas({ from: txOptions.from })).toString(),
      gasPrice: txOptions.gasPrice? txOptions.gasPrice: '0x01',
    };
    return rawTx.send(calculatedTransactionOptions);
  }
}
