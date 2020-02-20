
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

// import Comparable from '../../m0_facilitator/observer/Comparable';

/**
 * Type of gateways.
 */
export enum GatewayType {
  Consensus = 'consensus',
  Most = 'most',
  ERC20 = 'erc20',
  NFT = 'nft'
}

export default class Gateway extends Comparable<Gateway> {

  public gatewayGA: string;

  public remoteGA: string;

  public gatewayType: GatewayType;

  public destinationGA: string;

  public remoteGatewayLastProvenBlockNumber?: BigNumber;

  public anchorGA: string;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to initialize the fields of Gateway model.
   *
   * @param gatewayGA Gateway global address.
   * @param remoteGA Remote chain's global address.
   * @param gatewayType Type of gateway.
   * @param destinationGA Destination chain global address.
   * @param remoteGatewayLastProvenBlockNumber Remote chain gateway's last anchored block number.
   * @param createdAt Time of creation of an gateway.
   * @param updatedAt Time of updation for an gateway.
   */
  public constructor(
    gatewayGA: string,
    remoteGA: string,
    gatewayType: GatewayType,
    destinationGA: string,
    anchorGA: string,
    remoteGatewayLastProvenBlockNumber?: BigNumber,
    createdAt?: Date,
    updatedAt?: Date
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

  public compareTo(other: Gateway): number {

  }
}
