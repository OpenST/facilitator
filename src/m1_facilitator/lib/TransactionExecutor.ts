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
import AvatarAccount from '../manifest/AvatarAccount';

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
  /** Transaction repository class. */
  private readonly transactionRepository: TransactionRepository;

  /** Web3 object */
  private readonly web3: Web3;

  /** Gas price at which transaction was sent. */
  private readonly gasPrice: BigNumber;

  /** Avatar account address which will send transaction. */
  private readonly from: string;

  /** Gas limit at which transaction was sent. */
  private gas?: BigNumber;

  /** Avatar account nonce value. */
  private nonce?: BigNumber;

  /** Avatar account object. */
  private readonly avatarAccount: AvatarAccount;

  /** Interval in ms at which Transaction record will be dequeued in regular interval.  */
  private readonly pollInterval: number;

  /** Set interval handle. */
  private setIntervalHandle: NodeJS.Timer | null;

  /**
   * Constructor.
   *
   * @param web3 The web3 instance to be used for fetching nonce.
   * @param transactionRepository Transaction repository instance.
   * @param from From avatar account address.
   * @param gasPrice Gas price at which transaction was sent.
   */
  public constructor(
    transactionRepository: TransactionRepository,
    web3: Web3,
    from: string,
    gasPrice: BigNumber,
    avatarAccount: AvatarAccount,
  ) {
    this.web3 = web3;
    this.transactionRepository = transactionRepository;
    this.from = from;
    this.gasPrice = gasPrice;
    this.avatarAccount = avatarAccount;
    this.pollInterval = 1 * 60 * 1000; // in ms
    this.setIntervalHandle = null;
  }

  /**
   * This method enqueues transactions to queue. TransactionRepository acts as
   * queue here. The method is called by services.
   *
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

  /**
   * It processes pending transactions in regular intervals.
   */
  public async start(): Promise<void> {
    await this.execute();
    this.setIntervalHandle = setInterval(
      async (): Promise<void> => this.execute(),
      this.pollInterval,
    );
  }

  /**
   * Stops processing of transactions by clearing setIntervalHandle.
   * It should be called when facilitator stops.
   */
  public async stop(): Promise<void> {
    if (this.setIntervalHandle) {
      clearInterval(this.setIntervalHandle);
    }
  }

  /**
   * Execute method does below:
   * - Dequeues transaction record in regular interval
   * - Process the transaction and constructs transaction parameters
   * - Sends the transaction by calling sendTransaction method.
   * - Updates Transaction repository with information like transactionHash, gas, nonce
   */
  private async execute(): Promise<void> {
    const transaction = await this.transactionRepository.dequeue();
    if (transaction !== null) {
      const txHash = await this.sendTransaction(transaction);
      transaction.transactionHash = txHash;
      transaction.gas = this.gas;
      transaction.nonce = this.nonce;
    }
  }

  /**
   * This method submits a raw transaction and returns transaction hash.
   *
   * @param transaction Transaction repository record.
   * @return Transaction hash.
   */
  private async sendTransaction(transaction: Transaction): Promise<string> {
    Logger.info(`Transaction to be processed: ${JSON.stringify(transaction)}`);
    return new Promise(async (onResolve, onReject): Promise<void> => {
      const txOptions = {
        from: transaction.avatarAccount,
        gas: transaction.gas,
        gasPrice: transaction.gasPrice,
        nonce: this.avatarAccount.getNonce(this.web3),
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
}
