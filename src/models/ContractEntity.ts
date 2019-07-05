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
import Comparable from "../observer/Comparable";

/**
 * Represents model object.
 */
export default class ContractEntity extends Comparable<ContractEntity> {
  public contractAddress: string;

  public entityType?: string;

  public timestamp?: BigNumber;

  /**
   * Constructor to set fields of Contract Entities table.
   * @param contractAddress Address of the contract.
   * @param entityType Type of the entity.
   * @param timestamp Last updated time in secs.
   */
  public constructor(
    contractAddress: string,
    entityType?: string,
    timestamp?: BigNumber,
  ) {
    super();
    this.contractAddress = contractAddress;
    this.entityType = entityType;
    this.timestamp = timestamp;
  }

  /**
   * Compares ContractEntity objects.
   * @param {ContractEntity} other ContractEntity object which is to be compared.
   * @returns {number} `0` if the objects are same, 1 if new object is greater and -1 if new object is lesser.
   */
  public compareTo(other: ContractEntity): number {

    const currentObject = this.contractAddress.concat(this.entityType!);

    const newObject = other.contractAddress.concat(other.entityType!);
    if (currentObject < newObject) {
      return 1;
    }

    if (currentObject > newObject) {
      return -1;
    }

    return 0;
  }
}
