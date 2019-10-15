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

import GatewayAddresses from "../../../src/Config/GatewayAddresses";

import assert from '../../test_utils/assert';
import GatewayConfig from '@openst/mosaic-chains/lib/src/Config/GatewayConfig';

describe('GatewayAddresses.fromGatewayConfig()', () => {

/**
 * It asserts the values in gateway address object with gateway config object.
 * @param gatewayAddresses GatewayAddresses object.
 * @param gatewayConfig GatewayConfig object.
 * @param auxChainId Auxiliary chain id.
 */
function assertGatewayAddressesInGatewayConfig(
  gatewayAddresses: GatewayAddresses,
  gatewayConfig: GatewayConfig,
  auxChainId: number
) {

  assert.strictEqual(
    gatewayAddresses.valueTokenAddress,
    gatewayConfig.originContracts.valueTokenAddress,
    'Invalid valuetoken address',
  );

  assert.strictEqual(
    gatewayAddresses.baseTokenAddress,
    gatewayConfig.originContracts.baseTokenAddress,
    'Invalid basetoken address',
  );

  assert.strictEqual(
    gatewayAddresses.stakePoolAddress,
    gatewayConfig.originContracts.stakePoolAddress!,
    'Invalid stakepool address',
  );

  assert.strictEqual(
    gatewayAddresses.originAnchorAddress,
    gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorAddress,
    'Invalid origin anchor address',
  );

  assert.strictEqual(
    gatewayAddresses.originAnchorOrganizationAddress,
    gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorOrganizationAddress,
    'Invalid origin anchor organization address',
  );

  assert.strictEqual(
    gatewayAddresses.auxiliaryAnchorAddress,
    gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorAddress,
    'Invalid auxiliary anchor address',
  );

  assert.strictEqual(
    gatewayAddresses.auxiliaryAnchorOrganizationAddress,
    gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorOrganizationAddress,
    'Invalid auxiliary anchor organization address',
  );

  assert.strictEqual(
    gatewayAddresses.originGatewayAddress,
    gatewayConfig.originContracts.eip20GatewayAddress,
    'Invalid origin gateway address',
  );

  assert.strictEqual(
    gatewayAddresses.auxiliaryGatewayAddress,
    gatewayConfig.auxiliaryContracts.eip20CoGatewayAddress,
    'Invalid auxiliary gateway address',
  );

  assert.strictEqual(
    gatewayAddresses.redeemPoolAddress,
    gatewayConfig.auxiliaryContracts.redeemPoolAddress!,
    'Invalid redeem pool address',
  );

  assert.strictEqual(
    gatewayAddresses.utilityTokenAddress,
    gatewayConfig.auxiliaryContracts.utilityTokenAddress,
    'Invalid  utility token address',
  );

  assert.strictEqual(
    gatewayAddresses.originGatewayOrganizationAddress,
    gatewayConfig.originContracts.gatewayOrganizationAddress,
    'Invalid origin gateway organization address',
  );

  assert.strictEqual(
    gatewayAddresses.auxiliaryGatewayOrganizationAddress,
    gatewayConfig.auxiliaryContracts.coGatewayOrganizationAddress,
    'Invalid auxiliary gateway organization address',
  );
  }
  const gatewayConfigPath = 'test/Facilitator/testdata/0x97BA58DBE58898F2B669C56496f46F638DC322d4.json';
  const gatewayConfig = GatewayConfig.fromFile(gatewayConfigPath);
  const auxChainId = gatewayConfig.auxChainId;

  it('should pass with valid arguments', () => {

    const gatewayAddresses = GatewayAddresses.fromGatewayConfig(gatewayConfig);

    assertGatewayAddressesInGatewayConfig(gatewayAddresses, gatewayConfig, auxChainId);

  });

  it('should fail when gateway config is null', () => {

    assert.throws(
      () => GatewayAddresses.fromGatewayConfig(null as any),
      'Gateway config should not be null',
    );

  });

  it('should fail when gateway config is undefined', () => {

    assert.throws(
      () => GatewayAddresses.fromGatewayConfig(undefined as any),
      'Gateway config should not be null',
    );

  });
});
