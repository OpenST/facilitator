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
import BigNumber from 'bignumber.js';
import Logger from '../../common/Logger';

interface TxOptionInterface {
  from: string;
  gas: BigNumber;
  nonce: BigNumber;
}

export default class TransactionExecutor {
  private readonly web3: Web3;

  private readonly rawTx: any;

  private readonly inputTxOption: TxOptionInterface;

  /**
   * Constructor.
   *
   * @param web3 The web3 instance to be used for fetching nonce.
   * @param tx Raw transaction object.
   * @param inputTxOption Transaction options.
   */
  public constructor(web3: Web3, rawTx: any, inputTxOption: TxOptionInterface) {
    this.web3 = web3;
    this.rawTx = rawTx;
    this.inputTxOption = inputTxOption;
    this.execute.bind(this);
  }

  /**
   * This method submits a raw transaction and returns transaction hash.
   */
  public async execute(): Promise<string> {
    return new Promise(async (onResolve, onReject): Promise<void> => {
      const txOption = Object.assign({}, this.inputTxOption);
      if (this.inputTxOption.gas === undefined) {
        txOption.gas = await this.rawTx.estimateGas(this.inputTxOption).catch((e: Error): number => {
          Logger.error(`Error on estimating gas, using default value: ${e.message}`);
          return 6000000;
        });
        Logger.debug(`Transaction gas estimates  ${txOption.gas}`);
      }
      if (this.inputTxOption.nonce === undefined) {
        const account: Account = new Account(this.inputTxOption.from);
        txOption.nonce = await account.getNonce(this.web3);
        Logger.debug(`Nonce to be used for transaction sender: ${txOption.from} is ${txOption.nonce}`);
      }
      this.rawTx.send(txOption)
        .on('transactionHash', (hash: string): void => onResolve(hash))
        .on('error', (error: Error): void => onReject(error));
    });
  }
}
