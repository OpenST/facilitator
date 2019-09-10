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

/* eslint-disable class-methods-use-this */

import BigNumber from 'bignumber.js';

import Comparable from '../observer/Comparable';

export default class RedeemRequest extends Comparable<RedeemRequest> {
  public redeemRequestHash: string;

  public blockNumber: BigNumber;

  public amount?: BigNumber;

  public beneficiary?: string;

  public gasPrice?: BigNumber;

  public gasLimit?: BigNumber;

  public nonce?: BigNumber;

  public cogateway?: string;

  public redeemer?: string;

  public redeemerProxy?: string;

  public messageHash?: string;

  public createdAt?: Date;

  public updatedAt?: Date;

  public constructor(
    stakeRequestHash: string,
    blockNumber: BigNumber,
    amount?: BigNumber,
    beneficiary?: string,
    gasPrice?: BigNumber,
    gasLimit?: BigNumber,
    nonce?: BigNumber,
    cogateway?: string,
    redeemer?: string,
    redeemerProxy?: string,
    messageHash?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();

    this.redeemRequestHash = stakeRequestHash;
    this.amount = amount;
    this.beneficiary = beneficiary;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.nonce = nonce;
    this.cogateway = cogateway;
    this.redeemer = redeemer;
    this.redeemerProxy = redeemerProxy;
    this.blockNumber = blockNumber;
    this.messageHash = messageHash;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public compareTo(other: RedeemRequest): number {
    if (this.redeemRequestHash > other.redeemRequestHash) {
      return 1;
    }

    if (this.redeemRequestHash < other.redeemRequestHash) {
      return -1;
    }

    return 0;
  }
}
