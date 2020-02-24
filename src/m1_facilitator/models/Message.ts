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

import Comparable from '../../m0_facilitator/observer/Comparable';

/** Message types for deposit and withdraw */
export enum MessageType {
  Deposit = 'deposit',
  Withdraw = 'withdraw',
}

/** Status of messages */
export enum MessageStatus {
  Undeclared = 'undeclared',
  Declared = 'declared',
}

/**
 * Represents Message model object.
 */
export default class Message extends Comparable<Message> {
  public messageHash: string;

  public type: MessageType;

  public sourceStatus: MessageStatus;

  public targetStatus: MessageStatus;

  public gatewayAddress: string;

  public intentHash?: string;

  public feeGasPrice?: BigNumber;

  public feeGasLimit?: BigNumber;

  public sourceDeclarationBlockNumber?: BigNumber;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to set fields of Message model.
   *
   * @param messageHash Message hash is unique for each request.
   * @param type Type of the message deposit/withdraw.
   * @param sourceStatus Status of message in the outbox of the gateway
   *                     on source chain.
   * @param targetStatus Status of message in the inbox of the gateway
   *                     on the auxiliary chain.
   * @param feeGasPrice Fee gas price for reward calculation.
   * @param feeGasLimit Fee gas limit for reward calculation.
   * @param gatewayAddress Gateway contract address.
   * @param sourceDeclarationBlockNumber Block number at which message was declared.
   * @param intentHash Intent hash.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    messageHash: string,
    type: MessageType,
    sourceStatus: MessageStatus,
    targetStatus: MessageStatus,
    gatewayAddress: string,
    feeGasPrice?: BigNumber,
    feeGasLimit?: BigNumber,
    sourceDeclarationBlockNumber?: BigNumber,
    intentHash?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.messageHash = messageHash;
    this.type = type;
    this.sourceStatus = sourceStatus;
    this.targetStatus = targetStatus;
    this.gatewayAddress = gatewayAddress;
    this.intentHash = intentHash;
    this.feeGasPrice = feeGasPrice;
    this.feeGasLimit = feeGasLimit;
    this.sourceDeclarationBlockNumber = sourceDeclarationBlockNumber;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Compares the `messageHash` primary key of two Message models.
   *
   * @param other A Message object to compare with.
   *
   * @returns 0 if two objects are equal, 1 if the current object is greater
   *                 and -1 if the specified object is greater.
   */
  public compareTo(other: Message): number {
    const currentKey = this.messageHash;
    const specifiedKey = other.messageHash;

    if (currentKey > specifiedKey) {
      return 1;
    }

    if (currentKey < specifiedKey) {
      return -1;
    }

    return 0;
  }
}
