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
import { TransactionObject, Tx } from 'web3/eth/types';
import BigNumber from 'bignumber.js';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionRepository';
import Logger from '../../common/Logger';

// TODO integrate TransactionObject type for rawTx

/**
 * Transaction executor class makes sure transactions are executed in a sequential order. Transaction repository act as
 * queue and stores transactions history.
 * It's responsibilities:
 * - Queueing transaction in TransactionRepository
 * - Execute transactions
 * - Makes sure nonce are in proper order
 */
export default class TransactionExecutor {
  private readonly transactionRepository: TransactionRepository;

  private readonly web3: Web3;

  private readonly gasPrice: BigNumber;

  private readonly from: string;

  private gas?: BigNumber;

  private nonce?: BigNumber;

  /**
   * Constructor.
   *
   * @param web3 The web3 instance to be used for fetching nonce.
   * @param transactionRepository Transaction repository instance.
   */
  public constructor(
    transactionRepository: TransactionRepository,
    web3: Web3,
    from: string,
    gasPrice: BigNumber,
  ) {
    this.web3 = web3;
    this.transactionRepository = transactionRepository;
    this.from = from;
    this.gasPrice = gasPrice;
  }

  /**
   * This method enqueue transactions to queue i.e. TransactionRepository.
   * @param rawTx Raw transaction object.
   */
  public async add(rawTx: any): Promise<void> {
    const transaction = new Transaction(
      this.from,
      rawTx,
      this.gasPrice,
    );
    await this.transactionRepository.enqueue(transaction);
  }

  private async execute(): Promise<void> {
    const transaction = await this.transactionRepository.dequeue();
    if (transaction !== null) {
      const txHash = await this.sendTransaction(transaction);
      transaction.transactionHash = txHash;
      transaction.gas = this.gas;
      transaction.nonce = this.nonce;
    }
  }

  private async sendTransaction(transaction: Transaction): Promise<string> {
    Logger.info(`Transaction to be processed: ${JSON.stringify(transaction)}`);
    return new Promise(async (onResolve, onReject): Promise<void> => {
      const txOptions = {
        from: transaction.avatarAccount,
        gas: transaction.gas,
        gasPrice: transaction.gasPrice,
        nonce: this.getNonce(),
      };
      if (txOptions.gas === undefined) {
        Logger.debug('Estimating gas for the transaction');
        const estimatedGas = await (transaction.rawTx).estimateGas(txOptions)
          .catch((e: Error): number => {
            Logger.error('Error on estimating gas, using default value  ', e);
            return 6000000;
          });
        Logger.debug(`Transaction gas estimates  ${txOptions.gas}`);
        txOptions.gas = new BigNumber(estimatedGas);
        this.gas = txOptions.gas;
      }
      transaction.rawTx.send(txOptions)
        .on('transactionHash', (txHash: string): void => onResolve(txHash))
        .on('error', (error: Error): void => onReject(error));
    });
  }

  private getNonce(): BigNumber {
    this.nonce = new BigNumber(0);
    return this.nonce;
  }
}
