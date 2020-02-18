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

import Comparable from '../observer/Comparable';

import assert = require('assert');

/**
 * Anchor class implements anchor model to be used from other parts of implementation.
 */
export default class Anchor extends Comparable<Anchor> {
  /** Anchor's global address. */
  public anchorGA: string;

  /** Anchor's last anchored block number. */
  public lastAnchoredBlockNumber: BigNumber;

  /** Specifies the creation date of the anchor model. */
  public createdAt?: Date;

  /** Specifies the update date of the anchor model. */
  public updatedAt?: Date;

  /**
   * Constructs an anchor from the given parameter.
   *
   * @param anchorGA Newly created anchor's global address.
   * @param lastAnchoredBlockNumber Newly created anchor's last anchored block number.
   * @param createdAt Specifies the anchor's creation date.
   * @param updatedAt Specifies the anchor's update date.
   *
   * @pre anchorGA is not empty.
   * @pre lastAnchoredBlockNumber is greater than or equal to 0.
   */
  public constructor(
    anchorGA: string,
    lastAnchoredBlockNumber: BigNumber,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();

    assert(anchorGA !== '');
    assert(lastAnchoredBlockNumber.greaterThanOrEqualTo(0));

    this.anchorGA = anchorGA;
    this.lastAnchoredBlockNumber = lastAnchoredBlockNumber;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * compareTo() function implements comparison between two anchor objects.
   *
   * The function first compares case-insensitively the `anchorGA` attributes
   * and if attributes for the both anchor objects are equal, compares
   * `lastAnchoredBlockNumber` attributes.
   *
   *
   * @param other An anchor object to compare with.
   *
   * @returns `> 0` if the current object is greater than the given one.
   *          `0` if the current object is equal to given one.
   *          `< 0` if the current object is less than the given one.
   */
  public compareTo(other: Anchor): number {
    if (this.anchorGA.localeCompare(other.anchorGA, 'en', { sensitivity: 'base' }) !== 0) {
      return this.anchorGA.localeCompare(other.anchorGA, 'en', { sensitivity: 'base' });
    }

    return this.lastAnchoredBlockNumber.comparedTo(other.lastAnchoredBlockNumber);
  }
}
