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
import Comparable from '../../common/observer/Comparable';

/**
 * Transaction model acts as an instance for each record of TransactionRepository.
 */
export default class Transaction extends Comparable<Transaction> {
  /** Avatar account address */
  public readonly avatarAccount: string;

  /** Gas limit value at which transaction was sent */
  public readonly gas: BigNumber;

  /** Raw transaction object */
  public readonly rawTx: any; // TODO type

  /** Unique auto incremented id */
  public readonly id?: BigNumber;

  /** Transaction hash */
  public readonly transactionHash?: string;

  /** Avatar account current nonce */
  public readonly nonce?: BigNumber;

  /** Specifies the creation date of the anchor model. */
  public readonly createdAt?: Date;

  /** Specifies the update date of the anchor model. */
  public readonly updatedAt?: Date;

  /**
   * Transaction model constructor.
   *
   * @param avatarAccount Avatar account address.
   * @params gas Gas limit at which transaction was sent.
   * @param rawTx Raw transaction object.
   * @param id Unique auto increment id.
   * @param transactionHash Transaction hash.
   * @param nonce Nonce of the transaction.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    avatarAccount: string,
    gas: BigNumber,
    rawTx: any,
    id?: BigNumber,
    transactionHash?: string,
    nonce?: BigNumber,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.rawTx = rawTx;
    this.avatarAccount = avatarAccount;
    this.gas = gas;
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
