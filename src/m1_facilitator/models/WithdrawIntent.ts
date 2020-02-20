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

import Comparable from '../../m0_facilitator/observer/Comparable';

/**
 * Represents WithdrawIntent model object.
 */
export default class WithdrawIntent extends Comparable<WithdrawIntent> {
  public intentHash: string;

  public messageHash: string;

  public tokenAddress?: string;

  public amount?: BigNumber;

  public beneficiary?: string;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to set fields of WithdrawIntent model.
   *
   * @param intentHash Withdraw intent hash.
   * @param messageHash Message hash.
   * @param tokenAddress Value token address.
   * @param amount Withdraw amount.
   * @param beneficiary Beneficiary address.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    intentHash: string,
    messageHash: string,
    tokenAddress?: string,
    amount?: BigNumber,
    beneficiary?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.intentHash = intentHash;
    this.messageHash = messageHash;
    this.tokenAddress = tokenAddress;
    this.amount = amount;
    this.beneficiary = beneficiary;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Compares two withdraw intent models.
   *
   * @param other A withdraw intent object to compare with.
   *
   * @returns 0 if two objects are equal, 1 if the current object is greater
   *                 and -1 if the specified object is greater.
   */
  public compareTo(other: WithdrawIntent): number {
    return this.intentHash.localeCompare(other.intentHash);
  }
}
