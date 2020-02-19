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

import GatewayConfig from '@openst/mosaic-chains/lib/src/Config/GatewayConfig';
import GatewayAddresses from '../../../../src/m0-facilitator/Config/GatewayAddresses';

import assert from '../../../test_utils/assert';
import Utils from '../../../../src/m0-facilitator/Utils';

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
    auxChainId: number,
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

    const stakePoolAddress = gatewayConfig.originContracts.stakePoolAddress
    || gatewayConfig.mosaicConfig.originChain.contractAddresses.stakePoolAddress;

    assert.strictEqual(
      gatewayAddresses.stakePoolAddress,
      stakePoolAddress,
      'Invalid stakepool address',
    );

    const originAddresses = gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId]
      .contractAddresses.origin;
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

    const auxiliaryAddresses = gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId]
      .contractAddresses.auxiliary;
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
      gatewayConfig.originContracts.eip20GatewayAddress,
      'Invalid origin gateway address',
    );

    assert.strictEqual(
      gatewayAddresses.eip20CoGatewayAddress,
      gatewayConfig.auxiliaryContracts.eip20CoGatewayAddress,
      'Invalid auxiliary gateway address',
    );

    const redeemPoolAddress = gatewayConfig.auxiliaryContracts.redeemPoolAddress
    || auxiliaryAddresses.redeemPoolAddress;

    assert.strictEqual(
      gatewayAddresses.redeemPoolAddress,
      redeemPoolAddress,
      'Invalid redeem pool address',
    );

    assert.strictEqual(
      gatewayAddresses.utilityTokenAddress,
      gatewayConfig.auxiliaryContracts.utilityTokenAddress,
      'Invalid  utility token address',
    );

    assert.strictEqual(
      gatewayAddresses.gatewayOrganizationAddress,
      gatewayConfig.originContracts.gatewayOrganizationAddress,
      'Invalid origin gateway organization address',
    );

    assert.strictEqual(
      gatewayAddresses.coGatewayOrganizationAddress,
      gatewayConfig.auxiliaryContracts.coGatewayOrganizationAddress,
      'Invalid auxiliary gateway organization address',
    );
  }
  const gatewayConfigPath = 'testdata/m0-facilitator/0xae02c7b1c324a8d94a564bc8d713df89eae441fe.json';
  const gatewayConfig = GatewayConfig.fromFile(gatewayConfigPath);
  const { auxChainId } = gatewayConfig;

  it('should pass with valid arguments', () => {
    // Stakepool and redeem pool addresses are taken from
    const gatewayAddresses = GatewayAddresses.fromGatewayConfig(gatewayConfig);

    assertGatewayAddressesInGatewayConfig(gatewayAddresses, gatewayConfig, auxChainId);
  });

  it('should pass when stakepool and redeempool addresses are present in gateway config', () => {
    gatewayConfig.originContracts.stakePoolAddress = Utils.toChecksumAddress(
      '0xc6fF898ceBf631eFb58eEc7187E4c1f70AE8d943',
    );
    gatewayConfig.auxiliaryContracts.redeemPoolAddress = Utils.toChecksumAddress(
      '0xdab6898ceBf631eFb58eEc7187E4c1f70AE8d943',
    );
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
