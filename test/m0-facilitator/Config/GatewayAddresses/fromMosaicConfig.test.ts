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

import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import GatewayAddresses from '../../../../src/m0-facilitator/Config/GatewayAddresses';

import assert from '../../test_utils/assert';

describe('GatewayAddresses.fromMosaicConfig()', () => {
/**
 * It asserts the values in gateway address object with mosaic config object.
 * @param gatewayAddresses GatewayAddresses object.
 * @param mosaicConfig MosaicConfig object.
 * @param auxChainId Auxiliary chain id.
 */
  function assertGatewayAddressesInMosaicConfig(
    gatewayAddresses: GatewayAddresses,
    mosaicConfig: MosaicConfig,
    auxChainId: number,
  ) {
    assert.strictEqual(
      gatewayAddresses.valueTokenAddress,
      mosaicConfig.originChain.contractAddresses.valueTokenAddress,
      'Invalid valuetoken address',
    );

    const originAddresses = mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin;
    assert.strictEqual(
      gatewayAddresses.baseTokenAddress,
      originAddresses.baseTokenAddress,
      'Invalid basetoken address',
    );

    assert.strictEqual(
      gatewayAddresses.stakePoolAddress,
      mosaicConfig.originChain.contractAddresses.stakePoolAddress,
      'Invalid stakepool address',
    );

    assert.strictEqual(
      gatewayAddresses.originAnchorAddress,
      originAddresses.anchorAddress,
      'Invalid origin anchor address',
    );

    assert.strictEqual(
      gatewayAddresses.originAnchorOrganizationAddress,
      originAddresses.anchorOrganizationAddress,
      'Invalid origin anchor organization address',
    );

    const auxiliaryAddresses = mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary;
    assert.strictEqual(
      gatewayAddresses.auxiliaryAnchorAddress,
      auxiliaryAddresses.anchorAddress,
      'Invalid auxiliary anchor address',
    );

    assert.strictEqual(
      gatewayAddresses.auxiliaryAnchorOrganizationAddress,
      auxiliaryAddresses.anchorOrganizationAddress,
      'Invalid auxiliary anchor organization address',
    );

    assert.strictEqual(
      gatewayAddresses.eip20GatewayAddress,
      originAddresses.eip20GatewayAddress,
      'Invalid origin gateway address',
    );

    assert.strictEqual(
      gatewayAddresses.eip20CoGatewayAddress,
      auxiliaryAddresses.eip20CoGatewayAddress,
      'Invalid auxiliary gateway address',
    );

    assert.strictEqual(
      gatewayAddresses.redeemPoolAddress,
      auxiliaryAddresses.redeemPoolAddress,
      'Invalid redeem pool address',
    );

    assert.strictEqual(
      gatewayAddresses.utilityTokenAddress,
      auxiliaryAddresses.utilityTokenAddress,
      'Invalid  utility token address',
    );

    assert.strictEqual(
      gatewayAddresses.gatewayOrganizationAddress,
      originAddresses.gatewayOrganizationAddress,
      'Invalid origin gateway organization address',
    );

    assert.strictEqual(
      gatewayAddresses.coGatewayOrganizationAddress,
      auxiliaryAddresses.coGatewayOrganizationAddress,
      'Invalid auxiliary gateway organization address',
    );
  }
  const mosaicConfigPath = 'testdata/mosaic.json';
  const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);
  const auxChainId = parseInt(Object.keys(mosaicConfig.auxiliaryChains)[0], 10);

  it('should pass with valid arguments', () => {
    const gatewayAddresses = GatewayAddresses.fromMosaicConfig(mosaicConfig, auxChainId);

    assertGatewayAddressesInMosaicConfig(gatewayAddresses, mosaicConfig, auxChainId);
  });

  it('should fail when auxiliary chain is not present in mosaic config', () => {
    const auxChain = 100;
    assert.throws(
      () => GatewayAddresses.fromMosaicConfig(mosaicConfig, auxChain),
      `Auxchain id ${auxChain} is not present in mosaic config`,
    );
  });
});
