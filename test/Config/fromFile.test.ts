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
import { Config, FacilitatorConfig } from '../../src/Config/Config';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';
import GatewayAddresses from '../../src/Config/GatewayAddresses';

describe('Config.fromFile()', () => {
  const mosaicConfigPath = 'test/Config/mosaic-config.json';
  const facilitatorConfigPath = 'test/Config/facilitator-config.json';
  const auxChain = 3;

  it('should pass with valid arguments', () => {
    const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = FacilitatorConfig.fromChain(auxChain);
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

    const config = Config.fromFile(facilitatorConfigPath, mosaicConfigPath);

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
});
