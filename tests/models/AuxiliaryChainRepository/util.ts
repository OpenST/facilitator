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

import {
  AuxiliaryChainAttributes,
  AuxiliaryChain,
} from '../../../src/models/AuxiliaryChainRepository';

import assert = require('assert');

const Util = {
  checkAuxiliaryChainAgainstAttributes(
    auxiliaryChain: AuxiliaryChain,
    auxiliaryChainAttributes: AuxiliaryChainAttributes,
  ): void {
    assert.strictEqual(
      auxiliaryChain.chainId,
      auxiliaryChainAttributes.chainId,
      'chainId should match',
    );

    assert.strictEqual(
      auxiliaryChain.originChainName,
      auxiliaryChainAttributes.originChainName,
      'originChainName should match',
    );

    assert.strictEqual(
      auxiliaryChain.ostGatewayAddress,
      auxiliaryChainAttributes.ostGatewayAddress,
      'ostGatewayAddress should match',
    );

    assert.strictEqual(
      auxiliaryChain.ostCoGatewayAddress,
      auxiliaryChainAttributes.ostCoGatewayAddress,
      'ostCoGatewayAddress should match',
    );

    assert.strictEqual(
      auxiliaryChain.anchorAddress,
      auxiliaryChainAttributes.anchorAddress,
      'anchorAddress should match',
    );

    assert.strictEqual(
      auxiliaryChain.coAnchorAddress,
      auxiliaryChainAttributes.coAnchorAddress,
      'coAnchorAddress should match',
    );

    if (auxiliaryChainAttributes.hasOwnProperty('lastProcessedBlockNumber')) {
      assert.notStrictEqual(
        auxiliaryChain.lastProcessedBlockNumber,
        auxiliaryChainAttributes.lastProcessedBlockNumber,
        'lastProcessedBlockNumber should match',
      );
    }

    if (auxiliaryChainAttributes.hasOwnProperty('lastOriginBlockHeight')) {
      assert.notStrictEqual(
        auxiliaryChain.lastOriginBlockHeight,
        auxiliaryChainAttributes.lastOriginBlockHeight,
        'lastOriginBlockHeight should match',
      );
    }

    if (auxiliaryChainAttributes.hasOwnProperty('lastAuxiliaryBlockHeight')) {
      assert.notStrictEqual(
        auxiliaryChain.lastAuxiliaryBlockHeight,
        auxiliaryChainAttributes.lastAuxiliaryBlockHeight,
        'lastAuxiliaryBlockHeight should match',
      );
    }
  },

};

export default Util;
