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

import Comparable from '../../m0_facilitator/observer/Comparable';

import assert = require('assert');

/**
 * ERC20GatewayTokenPair class implements erc20GatewayTokenPair model to be used
 * from other parts of implementation.
 */
export default class ERC20GatewayTokenPair extends Comparable<ERC20GatewayTokenPair> {
  /** ERC20Gateway address. */
  public readonly erc20Gateway: string;

  /** Value token address. */
  public readonly valueToken: string;

  /** Utility token address. */
  public readonly utilityToken: string;

  /** Specifies the creation date of the model. */
  public readonly createdAt?: Date;

  /** Specifies the update date of the model. */
  public readonly updatedAt?: Date;

  /**
   * Constructs an ERC20GatewayTokenPair model from the given parameter.
   *
   * @param erc20Gateway Newly created erc20GatewayTokenPair's erc20 gateway address.
   * @param valueToken Newly created erc20GatewayTokenPair's value token address.
   * @param utilityToken Newly created erc20GatewayTokenPair's utility token address.
   * @param [createdAt] Specifies the model creation date.
   * @param [updatedAt] Specifies the model update date.
   *
   * @pre erc20Gateway is not an empty string.
   * @pre valueToken is not an empty string.
   * @pre utilityToken is not an empty string.
   */
  public constructor(
    erc20Gateway: string,
    valueToken: string,
    utilityToken: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();

    assert(erc20Gateway !== '');
    assert(valueToken !== '');
    assert(utilityToken !== '');

    this.erc20Gateway = erc20Gateway;
    this.valueToken = valueToken;
    this.utilityToken = utilityToken;

    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * compareTo() function implements comparison between two erc20GatewayTokenPair objects.
   *
   * The function first compares case-insensitively the `erc20Gateway` attributes
   * and if the attributes for the both objects are equal, compares case-insensitively
   * `valueToken` attributes.
   *
   * @param other A erc20GatewayTokenPair object to compare with.
   *
   * @returns `> 0` if the current object is greater than the given one.
   *          `0` if the current object is equal to given one.
   *          `< 0` if the current object is less than the given one.
   */
  public compareTo(other: ERC20GatewayTokenPair): number {
    const erc20GatewaysComparison: number = this.erc20Gateway.localeCompare(
      other.erc20Gateway, 'en', { sensitivity: 'base' },
    );

    if (erc20GatewaysComparison !== 0) {
      return erc20GatewaysComparison;
    }

    return this.valueToken.localeCompare(other.valueToken, 'en', { sensitivity: 'base' });
  }
}
