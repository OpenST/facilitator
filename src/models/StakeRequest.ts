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
import Lessable from '../observer/Lessable';

export default class StakeRequest extends Lessable<StakeRequest> {
  public stakeRequestHash: string;
  public amount?: BigNumber;
  public beneficiary?: string;
  public gasPrice?: BigNumber;
  public gasLimit?: BigNumber;
  public nonce?: BigNumber;
  public gateway?: string;
  public stakerProxy?: string;
  public messageHash?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  public constructor(
    stakeRequestHash: string,
    amount?: BigNumber,
    beneficiary?: string,
    gasPrice?: BigNumber,
    gasLimit?: BigNumber,
    nonce?: BigNumber,
    gateway?: string ,
    stakerProxy?: string,
    messageHash?: string,
  ) {
    super();

    this.stakeRequestHash = stakeRequestHash;
    this.amount = amount;
    this.beneficiary = beneficiary;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.nonce = nonce;
    this.gateway = gateway;
    this.stakerProxy = stakerProxy;
    this.messageHash = messageHash;
  }

  public less(other: StakeRequest): boolean {
    return this.stakeRequestHash < other.stakeRequestHash;
  }
}
