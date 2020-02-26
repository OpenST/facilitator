
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
import Comparable from '../../common/observer/Comparable';

/**
 * Type of gateways.
 */
export enum GatewayType {
  CONSENSUS = 'consensus',
  MOST = 'most',
  ERC20 = 'erc20',
  NFT = 'nft'
}

/**
 * Represents Gateway model object.
 */
export default class Gateway extends Comparable<Gateway> {
  public gatewayGA: string;

  public remoteGA: string;

  public gatewayType: GatewayType;

  public remoteGatewayLastProvenBlockNumber: BigNumber;

  public destinationGA?: string;

  public anchorGA: string;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to initialize the fields of Gateway model.
   *
   * @param gatewayGA Gateway global address.
   * @param remoteGA Remote gateway global address.
   * @param gatewayType Type of gateway.
   * @param anchorGA Anchor global address.
   * @param remoteGatewayLastProvenBlockNumber Remote chain gateway's last anchored block number.
   * @param [destinationGA] ERC20 contract address.
   * @param [createdAt] Specifies the gateway's creation date.
   * @param [updatedAt] Specifies the gateway's update date.
   */
  public constructor(
    gatewayGA: string,
    remoteGA: string,
    gatewayType: GatewayType,
    anchorGA: string,
    remoteGatewayLastProvenBlockNumber: BigNumber,
    destinationGA?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.gatewayGA = gatewayGA;
    this.remoteGA = remoteGA;
    this.gatewayType = gatewayType;
    this.destinationGA = destinationGA;
    this.remoteGatewayLastProvenBlockNumber = remoteGatewayLastProvenBlockNumber;
    this.anchorGA = anchorGA;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Compares the `gatewayGA` primary key of two gateway models.
   *
   * @param other A gateway object to compare with.
   *
   * @returns 0 if two objects are equal, 1 if the current object is greater
   *                 and -1 if the specified object is greater.
   */
  public compareTo(other: Gateway): number {
    const currentKey = this.gatewayGA;
    const specifiedKey = other.gatewayGA;

    if (currentKey > specifiedKey) {
      return 1;
    }

    if (currentKey < specifiedKey) {
      return -1;
    }

    return 0;
  }
}
