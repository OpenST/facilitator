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
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionRepository';

interface TxOptionInterface {
  from: string;
  gas: BigNumber;
  nonce: BigNumber;
}

/**
 * Transaction executor class makes sure transactions are executed in a sequential order. Transaction repository act as
 * queue and stores transactions history.
 * It's responsibilites:
 * - Queueing transaction in TransactionRepository
 * - Execute transactions
 * - Makes sure nonce are in proper order
 */
export default class TransactionExecutor {
  private readonly web3: Web3;

  public readonly transactionRepository: TransactionRepository;

  /**
   * Constructor.
   *
   * @param web3 The web3 instance to be used for fetching nonce.
   * @param transactionRepository Transaction repository instance.
   */
  public constructor(web3: Web3, transactionRepository: TransactionRepository) {
    this.web3 = web3;
    this.transactionRepository = transactionRepository;
  }

  /**
   * This method enqueue transactions to queue i.e. TransactionRepository.
   * @param rawTx Raw transaction object.
   * @param inputTxOption Tx option object
   */
  public async add(rawTx: any, inputTxOption: TxOptionInterface): Promise<void> {
    const transaction = new Transaction(
      inputTxOption.from,
      inputTxOption.gas,
      rawTx,
    );
    await this.transactionRepository.save(transaction);
  }
}
