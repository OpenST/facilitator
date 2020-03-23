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
 * Type of Transaction statuses:
 *
 * Pending: Transaction record is created in Pending state.
 * Sent: Transaction status is marked sent, when it's success and transaction hash is received.
 * Failure: Transaction is marked failure on exception while sending transaction.
 */
export enum TransactionStatus {
  Pending = 'pending',
  Sent = 'sent',
  Failed = 'failed',
}

/**
 * Transaction model acts as an instance for each record of TransactionRepository.
 */
export default class Transaction extends Comparable<Transaction> {
  /** Avatar account address. */
  public readonly fromAddress: string;

  /** To contract address. */
  public readonly toAddress: string;

  /** Raw transaction object. */
  public readonly encodedData: string;

  /** Gas price value at which transaction was sent. */
  public readonly gasPrice: BigNumber;

  /** Transaction status. */
  public transactionStatus: TransactionStatus;

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
   * @param fromAddress From account address.
   * @param toAddress To account address.
   * @param encodedData Encoded function call with function arguments. For more details please
   *                  check: https://web3js.readthedocs.io/en/v1.2.0/web3-eth-abi.html#encodefunctioncall
   * @params gasPrice Gas price at which transaction was sent.
   * @params transactionStatus Transaction status.
   * @params gas Gas limit at which transaction was sent.
   * @param id Unique auto increment id.
   * @param transactionHash Transaction hash.
   * @param nonce Nonce of the transaction.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    fromAddress: string,
    toAddress: string,
    encodedData: string,
    gasPrice: BigNumber,
    transactionStatus: TransactionStatus,
    gas?: BigNumber,
    id?: BigNumber,
    transactionHash?: string,
    nonce?: BigNumber,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.encodedData = encodedData;
    this.gas = gas;
    this.gasPrice = gasPrice;
    this.transactionStatus = transactionStatus;
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
