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
import { TransactionObject } from 'web3/eth/types';
import { Mutex } from 'async-mutex';
import BigNumber from 'bignumber.js';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionRepository';
import Logger from '../../common/Logger';
import AvatarAccount from '../manifest/AvatarAccount';

/**
 * Transaction executor class makes sure transactions are executed in a sequential order.
 * Transaction repository act as queue and stores transactions data.
 * It's responsibilities:
 * - Enqueue transaction in TransactionRepository
 * - Makes sure AvatarAccount nonce are processed in a sequential order
 * - Execute transactions at regular intervals
 */
export default class TransactionExecutor {
  /** Transaction repository class. */
  private readonly transactionRepository: TransactionRepository;

  /** Web3 provider instance */
  private readonly web3: Web3;

  /** Gas price at which transaction was sent. */
  private readonly gasPrice: BigNumber;

  /** Avatar account object. */
  private readonly avatarAccount: AvatarAccount;

  /** Interval in ms at which Transaction record will be dequeued in regular interval.  */
  private readonly pollInterval: number;

  /** Set interval handle. */
  private setIntervalHandle: NodeJS.Timer | null;

  /** Mutex instance variable  */
  private readonly mutex: Mutex;

  /**
   * Constructor.
   *
   * @param transactionRepository Transaction repository instance.
   * @param web3 The web3 provider instance to be used for fetching nonce.
   * @param gasPrice Gas price at which transaction needs to be sent.
   * @param avatarAccount Avatar account object.
   */
  public constructor(
    transactionRepository: TransactionRepository,
    web3: Web3,
    gasPrice: BigNumber,
    avatarAccount: AvatarAccount,
  ) {
    this.transactionRepository = transactionRepository;
    this.web3 = web3;
    this.gasPrice = gasPrice;
    this.avatarAccount = avatarAccount;
    this.pollInterval = 1 * 1 * 1000; // in ms
    this.setIntervalHandle = null;
    this.mutex = new Mutex();
  }

  /**
   * This method enqueue transactions to queue. TransactionRepository acts as
   * queue here. The method is called by services.
   *
   * @param toAddress Contract address at which transaction needs to be sent.
   * @param rawTx Raw transaction object.
   */
  public async add(toAddress: string, rawTx: TransactionObject<string>): Promise<void> {
    const transaction = new Transaction(
      this.avatarAccount.address,
      toAddress,
      rawTx.encodeABI(),
      this.gasPrice,
    );
    await this.transactionRepository.save(transaction);
    Logger.debug(`TransactionExecutor::Transaction: ${JSON.stringify(transaction)} queued successfully.`);
  }

  /**
   * It starts processing pending transactions in regular intervals.
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
   * - Checks if mutex lock is acquired or not.
   * - If mutex lock is already acquired, skip the execute flow. If mutex lock is not already acquired,
   *   then take the lock and execute the transaction. In the end release the lock.
   * - Dequeue transaction record in regular interval
   * - Process the transaction and constructs data for transaction to be executed
   * - Sends the transaction by calling sendTransaction method.
   * - Updates Transaction repository with information like transactionHash, gas, nonce
   *
   */
  private async execute(): Promise<void> {
    if (!this.mutex.isLocked()) {
      const release = await this.mutex.acquire();
      Logger.debug('TransactionExecutor:: transaction executor invoked.');
      const transaction = await this.transactionRepository.dequeue();
      try {
        if (transaction) {
          Logger.debug('TransactionExecutor:: Executing transaction');
          const nonce = await this.avatarAccount.getNonce(this.web3);
          Logger.debug(`TransactionExecutor::Executing transaction ${transaction.id && transaction.id.toString(10)}`);
          const response = await this.sendTransaction(transaction, nonce);
          transaction.transactionHash = response.transactionHash;
          transaction.gas = new BigNumber(response.gas);
          transaction.nonce = nonce;
          await this.transactionRepository.save(transaction);
          Logger.debug(`TransactionExecutor::Saving transaction ${transaction.id && transaction.id.toString(10)}`);
        }
      } catch (error) {
        Logger.debug('TransactionExecutor::Decreasing nonce in case of error');
        this.avatarAccount.decreaseNonce();
        Logger.error('TransactionExecutor::Error in executing transaction:'
          + `${transaction && transaction.id && transaction.id.toString(10)}.
        Error message: ${error.message}`);
      } finally {
        release();
      }
      Logger.debug('TransactionExecutor:: Transaction execution done');
    }
  }

  /**
   * This method submits a raw transaction and returns transaction hash.
   *
   * @param transaction Transaction repository record.
   * @param nonce Avatar account nonce.
   *
   * @return Transaction hash.
   */
  private async sendTransaction(transaction: Transaction, nonce: BigNumber): Promise<{
    transactionHash: string;
    gas: number;
  }> {
    Logger.info(`Sending transaction ${transaction.id}`);
    Logger.debug(`TransactionExecutor::Transaction to be processed: ${JSON.stringify(transaction)}`);
    Logger.debug(`TransactionExecutor::Nonce: ${nonce.toString(10)}.`);
    return new Promise(async (onResolve, onReject): Promise<void> => {
      const txOptions = {
        from: transaction.fromAddress,
        to: transaction.toAddress,
        data: transaction.encodedData,
        nonce: nonce.toNumber(),
        gasPrice: transaction.gasPrice.toString(10),
        gas: transaction.gas && transaction.gas.toString(10),
      };
      let estimatedGas: number;
      if (!txOptions.gas) {
        Logger.info('TransactionExecutor::Estimating gas for the transaction');
        estimatedGas = await this.web3.eth.estimateGas(txOptions);
        Logger.info(`TransactionExecutor::estimated gas  ${estimatedGas}`);
        txOptions.gas = estimatedGas.toString(10);
      }
      this.web3.eth.sendTransaction(txOptions)
        .on('transactionHash', (txHash: string): void => onResolve({ transactionHash: txHash, gas: estimatedGas }))
        .on('error', (e: Error): void => {
          Logger.error(`TransactionExecutor::Transaction failed with error: ${e.message}`);
          onReject(e);
        });
    });
  }
}
