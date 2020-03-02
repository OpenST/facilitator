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

import BigNumber from 'bignumber.js';
import { TransactionObject } from 'web3/eth/types';
import Comparable from '../../common/observer/Comparable';

/**
 * Transaction model acts as an instance for each record of TransactionRepository.
 */
export default class Transaction extends Comparable<Transaction> {
  /** Avatar account address */
  public readonly accountAddress: string;

  /** Raw transaction object */
  public readonly rawTx: TransactionObject<string>;

  /** Gas price value at which transaction was sent */
  public readonly gasPrice: BigNumber;

  /** Gas limit value at which transaction was sent */
  public gas?: BigNumber;

  /** Unique auto incremented id */
  public id?: BigNumber;

  /** Transaction hash */
  public transactionHash?: string;

  /** Avatar account current nonce */
  public nonce?: BigNumber;

  /** Specifies the creation date of the Transaction model. */
  public readonly createdAt?: Date;

  /** Specifies the updated date of the Transaction model. */
  public readonly updatedAt?: Date;

  /**
   * Transaction model constructor.
   *
   * @param accountAddress Avatar account address.
   * @param rawTx Raw transaction object.
   * @params gasPrice Gas price at which transaction was sent.
   * @params gas Gas limit at which transaction was sent.
   * @param id Unique auto increment id.
   * @param transactionHash Transaction hash.
   * @param nonce Nonce of the transaction.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    accountAddress: string,
    rawTx: TransactionObject<string>,
    gasPrice: BigNumber,
    gas?: BigNumber,
    id?: BigNumber,
    transactionHash?: string,
    nonce?: BigNumber,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.rawTx = rawTx;
    this.accountAddress = accountAddress;
    this.gas = gas;
    this.gasPrice = gasPrice;
    this.id = id;
    this.transactionHash = transactionHash;
    this.nonce = nonce;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Implementation of this method is not needed as this model repository will not be
   * attached to any service.
   */
  // eslint-disable-next-line class-methods-use-this
  public compareTo(): number {
    throw new Error('Implementation not needed');
  }
}
