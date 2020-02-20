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


import sinon, { SinonStub, SinonStubbedInstance } from 'sinon';

import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import GatewayConfig from '@openst/mosaic-chains/lib/src/Config/GatewayConfig';
import assert from '../../../test_utils/assert';
import SpyAssert from '../../../test_utils/SpyAssert';
import FacilitatorInit from '../../../../src/m0_facilitator/lib/FacilitatorInit';
import GatewayAddresses from '../../../../src/m0_facilitator/Config/GatewayAddresses';


describe('FacilitatorInit.getFromGatewayConfig()', () => {
  const gatewayConfigPath = 'test/Config/gateway-config.json';
  const auxChain = 3;
  const originChain = '2';

  function getMosaic(): object {
    return {
      originChain:
        {
          chain: originChain,
        },
      auxiliaryChains:
        {
          [auxChain]:
            {
              chainId: auxChain,
            },
        },
    };
  }

  const mosaic = getMosaic() as MosaicConfig;

  function getGatewayConfigStub(): SinonStubbedInstance<GatewayConfig> {
    const stubGatewayConfig = sinon.createStubInstance(GatewayConfig);
    stubGatewayConfig.mosaicConfig = mosaic;
    stubGatewayConfig.auxChainId = auxChain;
    return stubGatewayConfig;
  }

  function spyGatewayConfigfromFile(
    gatewayConfig: GatewayConfig,
  ): SinonStub<[string], GatewayConfig> {
    const spy = sinon.stub(
      GatewayConfig,
      'fromFile',
    ).callsFake(
      sinon.fake.returns(gatewayConfig),
    );
    return spy;
  }

  function spyFromGatewayConfig(
    gatewayAddresses: GatewayAddresses,
  ): SinonStub<[GatewayConfig], GatewayAddresses> {
    const spy = sinon.stub(
      GatewayAddresses,
      'fromGatewayConfig',
    ).callsFake(
      sinon.fake.returns(gatewayAddresses),
    );
    return spy;
  }

  it('should pass with valid arguments', () => {
    const gatewayConfig = getGatewayConfigStub();

    const gatewayConfigFromFileSpy = spyGatewayConfigfromFile(gatewayConfig);
    const dummyGatewayAddresses = sinon.createStubInstance(GatewayAddresses);
    const fromGatewayConfigSpy = spyFromGatewayConfig(dummyGatewayAddresses);

    const {
      originChainId,
      gatewayAddresses,
    } = FacilitatorInit.getFromGatewayConfig(auxChain, gatewayConfigPath);

    SpyAssert.assert(gatewayConfigFromFileSpy, 1, [[gatewayConfigPath]]);
    SpyAssert.assert(fromGatewayConfigSpy, 1, [[gatewayConfig]]);

    assert.strictEqual(
      originChainId,
      originChain,
      'Facilitator object is different',
    );
    assert.strictEqual(
      gatewayAddresses,
      dummyGatewayAddresses,
      'GatewayAddresses object is different',
    );

    sinon.restore();
  });

  it('should fail when aux chain is not present in gateway config', () => {
    const gatewayConfig = getGatewayConfigStub();

    const gatewayConfigFromFileSpy = spyGatewayConfigfromFile(gatewayConfig);
    const invalidAuxChain = 200;
    const emptyObject = FacilitatorInit.getFromGatewayConfig(invalidAuxChain, gatewayConfigPath);


    SpyAssert.assert(gatewayConfigFromFileSpy, 1, [[gatewayConfigPath]]);
    assert.strictEqual(
      Object.keys(emptyObject).length === 0,
      true,
      'Object must be empty',
    );

    sinon.restore();
  });
});
