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
//
// ----------------------------------------------------------------------------


import BigNumber from 'bignumber.js';

import Comparable from '../../observer/Comparable';

/**
 * Represents Message model object.
 */
export default class Message extends Comparable<Message> {
  public messageHash: string;

  public type: string;

  public intentHash: string;

  public sourceStatus?: string;

  public targetStatus?: string;

  public gasPrice?: BigNumber;

  public gasLimit?: BigNumber;

  public gatewayAddress?: string;

  public sourceDeclarationBlockNumber?: BigNumber;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to set fields of Messages model.
   *
   * @param messageHash Message hash is unique for each request.
   * @param type Type of the message deposit/withdraw.
   * @param intentHash Intent hash.
   * @param sourceStatus Status of source.
   * @param targetStatus Status of target.
   * @param gasPrice Gas price that staker is ready to pay to get the stake and mint process done.
   * @param gasLimit Gas limit that staker is ready to pay.
   * @param gatewayAddress Gateway contract address.
   * @param sourceDeclarationBlockNumber Source block height at which message wa declared.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    messageHash: string,
    type: string,
    intentHash: string,
    sourceStatus?: string,
    targetStatus?: string,
    gasPrice?: BigNumber,
    gasLimit?: BigNumber,
    gatewayAddress?: string,
    sourceDeclarationBlockNumber?: BigNumber,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.messageHash = messageHash;
    this.type = type;
    this.intentHash = intentHash;
    this.sourceStatus = sourceStatus;
    this.targetStatus = targetStatus;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.gatewayAddress = gatewayAddress;
    this.sourceDeclarationBlockNumber = sourceDeclarationBlockNumber;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Compares two Message models.
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
