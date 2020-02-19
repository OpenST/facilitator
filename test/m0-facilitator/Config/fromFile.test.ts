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


import sinon from 'sinon';

import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import { Config, FacilitatorConfig, ConfigType } from '../../../src/m0-facilitator/Config/Config';
import assert from '../../test_utils/assert';
import SpyAssert from '../../test_utils/SpyAssert';
import GatewayAddresses from '../../../src/m0-facilitator/Config/GatewayAddresses';

describe('Config.fromFile()', () => {
  const mosaicConfigPath = 'test/Config/mosaic-config.json';
  const facilitatorConfigPath = 'test/Config/facilitator-config.json';
  const auxChain = 3;
  const originChain = 'dev-origin';
  const dummyGatewayAddress = '0x34817AF7B685DBD8a360e8Bed3121eb03D56C9BD';

  it('should pass with valid arguments', () => {
    const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = FacilitatorConfig.fromChain(originChain, auxChain, dummyGatewayAddress);
    facilitator.auxChainId = auxChain;
    const gatewayAddresses = sinon.createStubInstance(GatewayAddresses);

    const mosaicConfigSpy = sinon.replace(
      MosaicConfig,
      'fromFile',
      sinon.fake.returns(mosaic),
    );

    const gatewayAddressesSpy = sinon.replace(
      GatewayAddresses,
      'fromMosaicConfig',
      sinon.fake.returns(gatewayAddresses),
    );

    const facilitatorConfigSpy = sinon.replace(
      FacilitatorConfig,
      'fromFile',
      sinon.fake.returns(facilitator),
    );

    const config = Config.fromFile(facilitatorConfigPath, mosaicConfigPath, ConfigType.MOSAIC);

    SpyAssert.assert(mosaicConfigSpy, 1, [[mosaicConfigPath]]);
    SpyAssert.assert(facilitatorConfigSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(gatewayAddressesSpy, 1, [[mosaic, auxChain]]);
    assert.strictEqual(
      config.facilitator,
      facilitator,
      'Facilitator object is different',
    );
    assert.strictEqual(
      config.gatewayAddresses,
      gatewayAddresses,
      'GatewayAddresses object is different',
    );

    sinon.restore();
  });

  it('should fail when invalid config type is provided', () => {
    const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = FacilitatorConfig.fromChain(originChain, auxChain, dummyGatewayAddress);
    facilitator.auxChainId = auxChain;
    const gatewayAddresses = sinon.createStubInstance(GatewayAddresses);
    const invalidConfigType = 'invalidconfigtype' as ConfigType;

    sinon.replace(MosaicConfig, 'fromFile', sinon.fake.returns(mosaic));

    sinon.replace(GatewayAddresses, 'fromMosaicConfig', sinon.fake.returns(gatewayAddresses));

    sinon.replace(FacilitatorConfig, 'fromFile', sinon.fake.returns(facilitator));

    assert.throws(
      () => Config.fromFile(facilitatorConfigPath, mosaicConfigPath, invalidConfigType),
      `Invalid config type ${invalidConfigType}`,
    );
    sinon.restore();
  });
});
