// Copyright 2019 OpenST Ltd.
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


import assert from 'assert';
import BigNumber from 'bignumber.js';
import * as web3utils from 'web3-utils';

import Comparable from '../observer/Comparable';

/**
 * Represents Message model object.
 */
export default class Message extends Comparable<Message> {
  public messageHash: string;

  public type: string;

  public direction: string;

  public gatewayAddress?: string;

  public sourceStatus?: string;

  public targetStatus?: string;

  public gasPrice?: BigNumber;

  public gasLimit?: BigNumber;

  public nonce?: BigNumber;

  public sender?: string;

  public sourceDeclarationBlockHeight?: BigNumber;

  public secret?: string;

  public hashLock?: string;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to set fields of Messages model.
   *
   * @param messageHash Message hash is unique for each request.
   * @param type Type of the message stake/redeem.
   * @param direction o2a or a2o direction.
   * @param gatewayAddress Gateway contract address.
   * @param sourceStatus Status of source.
   * @param targetStatus Status of target.
   * @param gasPrice Gas price that staker is ready to pay to get the stake and mint process done.
   * @param gasLimit Gas limit that staker is ready to pay.
   * @param nonce Nonce of the staker address.
   * @param sender staker's / redeemer's proxy address (from StakePool/RedeemPool contract).
   * @param sourceDeclarationBlockHeight Source block height at which message wa declared.
   * @param secret Unlock secret for the hashLock provide by the staker while initiating the stake.
   * @param hashLock Hash Lock provided by the facilitator.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    messageHash: string,
    type: string,
    direction: string,
    gatewayAddress?: string,
    sourceStatus?: string,
    targetStatus?: string,
    gasPrice?: BigNumber,
    gasLimit?: BigNumber,
    nonce?: BigNumber,
    sender?: string,
    sourceDeclarationBlockHeight?: BigNumber,
    secret?: string,
    hashLock?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.messageHash = messageHash;
    this.type = type;
    this.direction = direction;
    this.gatewayAddress = gatewayAddress;
    this.sourceStatus = sourceStatus;
    this.targetStatus = targetStatus;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.nonce = nonce;
    this.sender = sender;
    this.sourceDeclarationBlockHeight = sourceDeclarationBlockHeight;
    this.secret = secret;
    this.hashLock = hashLock;
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

  /**
   * Check if hashlock is valid or not.
   */
  public isValidSecret(): boolean {
    assert(this.secret !== undefined);

    if (web3utils.keccak256(this.secret as string) === this.hashLock) {
      return true;
    }
    return false;
  }
}
