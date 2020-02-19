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


import BigNumber from 'bignumber.js';

import Comparable from '../observer/Comparable';

/**
 * Represents AuxiliaryChain model object.
 */
export default class AuxiliaryChain extends Comparable<AuxiliaryChain> {
  public chainId: number;

  public originChainName: string;

  public eip20GatewayAddress: string;

  public eip20CoGatewayAddress: string;

  public anchorAddress: string;

  public coAnchorAddress: string;

  public lastOriginBlockHeight?: BigNumber;

  public lastAuxiliaryBlockHeight?: BigNumber;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to set fields of AuxiliaryChain model.
   *
   * @param chainId Chain identifier.
   * @param originChainName Name of the origin chain.
   * @param eip20GatewayAddress Gateway contract address.
   * @param eip20CoGatewayAddress CoGateway contract address.
   * @param anchorAddress Anchor contract address.
   * @param coAnchorAddress CoAnchor contract address.
   * @param lastOriginBlockHeight Latest origin chain block height.
   * @param lastAuxiliaryBlockHeight Latest auxiliary chain block height.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    chainId: number,
    originChainName: string,
    eip20GatewayAddress: string,
    eip20CoGatewayAddress: string,
    anchorAddress: string,
    coAnchorAddress: string,
    lastOriginBlockHeight?: BigNumber,
    lastAuxiliaryBlockHeight?: BigNumber,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.chainId = chainId;
    this.originChainName = originChainName;
    this.eip20GatewayAddress = eip20GatewayAddress;
    this.eip20CoGatewayAddress = eip20CoGatewayAddress;
    this.anchorAddress = anchorAddress;
    this.coAnchorAddress = coAnchorAddress;
    this.lastOriginBlockHeight = lastOriginBlockHeight;
    this.lastAuxiliaryBlockHeight = lastAuxiliaryBlockHeight;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Compares two auxiliary chain models.
   *
   * @param other An auxiliary chain object to compare with.
   *
   * @returns 0 if two objects are equal, 1 if the current object is greater
   *                 and -1 if the specified object is greater.
   */
  public compareTo(other: AuxiliaryChain): number {
    const currentKey = this.chainId;
    const specifiedKey = other.chainId;

    if (currentKey > specifiedKey) {
      return 1;
    }

    if (currentKey < specifiedKey) {
      return -1;
    }

    return 0;
  }
}
