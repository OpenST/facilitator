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

import ERC20GatewayTokenPair from '../../../../src/m1_facilitator/models/ERC20GatewayTokenPair';
import assert from '../../../test_utils/assert';

export interface ERC20GatewayTokenPairAttributes {
  erc20Gateway?: string;
  valueToken?: string;
  utilityToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function assertERC20GatewayTokenPairAttributes(
  erc20GatewayTokenPair: ERC20GatewayTokenPair,
  attributes: ERC20GatewayTokenPairAttributes,
): void {
  if (Object.prototype.hasOwnProperty.call(attributes, 'erc20Gateway')) {
    assert.strictEqual(
      erc20GatewayTokenPair.erc20Gateway,
      attributes.erc20Gateway,
    );
  }

  if (Object.prototype.hasOwnProperty.call(attributes, 'valueToken')) {
    assert.strictEqual(
      erc20GatewayTokenPair.valueToken,
      attributes.valueToken,
    );
  }

  if (Object.prototype.hasOwnProperty.call(attributes, 'utilityToken')) {
    assert.strictEqual(
      erc20GatewayTokenPair.utilityToken,
      attributes.utilityToken,
    );
  }

  if (Object.prototype.hasOwnProperty.call(attributes, 'createdAt')) {
    assert.strictEqual(
      erc20GatewayTokenPair.createdAt,
      attributes.createdAt,
    );
  }

  if (Object.prototype.hasOwnProperty.call(attributes, 'updatedAt')) {
    assert.strictEqual(
      erc20GatewayTokenPair.updatedAt,
      attributes.updatedAt,
    );
  }
}
