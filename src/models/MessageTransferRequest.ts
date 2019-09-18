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

/**
 * It represents MessageTransferRequest model object. It stores stake and redeem requests.
 */
export default class MessageTransferRequest extends Comparable<MessageTransferRequest> {
  public requestHash: string;

  public requestType: string;

  public blockNumber: BigNumber;

  public amount?: BigNumber;

  public beneficiary?: string;

  public gasPrice?: BigNumber;

  public gasLimit?: BigNumber;

  public nonce?: BigNumber;

  public gateway?: string;

  public sender?: string;

  public senderProxy?: string;

  public messageHash?: string;

  public createdAt?: Date;

  public updatedAt?: Date;

  public constructor(
    requestHash: string,
    requestType: string,
    blockNumber: BigNumber,
    amount?: BigNumber,
    beneficiary?: string,
    gasPrice?: BigNumber,
    gasLimit?: BigNumber,
    nonce?: BigNumber,
    gateway?: string,
    sender?: string,
    senderProxy?: string,
    messageHash?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();

    this.requestHash = requestHash;
    this.requestType = requestType;
    this.amount = amount;
    this.beneficiary = beneficiary;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.nonce = nonce;
    this.gateway = gateway;
    this.sender = sender;
    this.senderProxy = senderProxy;
    this.blockNumber = blockNumber;
    this.messageHash = messageHash;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public compareTo(other: MessageTransferRequest): number {
    if (this.requestHash > other.requestHash) {
      return 1;
    }

    if (this.requestHash < other.requestHash) {
      return -1;
    }

    return 0;
  }
}
