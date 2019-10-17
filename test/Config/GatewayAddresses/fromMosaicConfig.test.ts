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
import GatewayAddresses from "../../../src/Config/GatewayAddresses";

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

  assert.strictEqual(
    gatewayAddresses.baseTokenAddress,
    mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.baseTokenAddress,
    'Invalid basetoken address',
  );

  assert.strictEqual(
    gatewayAddresses.stakePoolAddress,
    mosaicConfig.originChain.contractAddresses.stakePoolAddress,
    'Invalid stakepool address',
  );

  assert.strictEqual(
    gatewayAddresses.originAnchorAddress,
    mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorAddress,
    'Invalid origin anchor address',
  );

  assert.strictEqual(
    gatewayAddresses.originAnchorOrganizationAddress,
    mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorOrganizationAddress,
    'Invalid origin anchor organization address',
  );

  assert.strictEqual(
    gatewayAddresses.auxiliaryAnchorAddress,
    mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorAddress,
    'Invalid auxiliary anchor address',
  );

  assert.strictEqual(
    gatewayAddresses.auxiliaryAnchorOrganizationAddress,
    mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorOrganizationAddress,
    'Invalid auxiliary anchor organization address',
  );

  assert.strictEqual(
    gatewayAddresses.eip20GatewayAddress,
    mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.eip20GatewayAddress,
    'Invalid origin gateway address',
  );

  assert.strictEqual(
    gatewayAddresses.eip20CoGatewayAddress,
    mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.eip20CoGatewayAddress,
    'Invalid auxiliary gateway address',
  );

  assert.strictEqual(
    gatewayAddresses.redeemPoolAddress,
    mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.redeemPoolAddress,
    'Invalid redeem pool address',
  );

  assert.strictEqual(
    gatewayAddresses.utilityTokenAddress,
    mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.utilityTokenAddress,
    'Invalid  utility token address',
  );

  assert.strictEqual(
    gatewayAddresses.eip20GatewayOrganizationAddress,
    mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.gatewayOrganizationAddress,
    'Invalid origin gateway organization address',
  );

  assert.strictEqual(
    gatewayAddresses.eip20CoGatewayOrganizationAddress,
    mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.coGatewayOrganizationAddress,
    'Invalid auxiliary gateway organization address',
  );
  }
  const mosaicConfigPath = 'test/Facilitator/testdata/mosaic-config.json';
  const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);
  const auxChainId = parseInt(Object.keys(mosaicConfig.auxiliaryChains)[0]);

  it('should pass with valid arguments', () => {

    const gatewayAddresses = GatewayAddresses.fromMosaicConfig(mosaicConfig, auxChainId);

    assertGatewayAddressesInMosaicConfig(gatewayAddresses, mosaicConfig, auxChainId);

  });

  it('should fail when auxiliary chain is not present in mosaic config', () => {

    const auxChainId = 100;
    assert.throws(
      () => GatewayAddresses.fromMosaicConfig(mosaicConfig, auxChainId),
      `Auxchain id ${auxChainId} is not present in mosaic config`,
    );

  });
});
