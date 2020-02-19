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


import sinon, { SinonStub } from 'sinon';

import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import assert from '../../../test_utils/assert';
import SpyAssert from '../../../test_utils/SpyAssert';
import FacilitatorInit from '../../../../src/m0-facilitator/lib/FacilitatorInit';
import GatewayAddresses from '../../../../src/m0-facilitator/Config/GatewayAddresses';


describe('FacilitatorInit.getFromMosaicConfig()', () => {
  const mosaicConfigPath = 'test/Config/mosaic-config.json';
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

  function spyMosaicfromFile(mosaicConfig: MosaicConfig): SinonStub<[string], MosaicConfig> {
    const spy = sinon.stub(
      MosaicConfig,
      'fromFile',
    ).callsFake(
      sinon.fake.returns(mosaicConfig),
    );
    return spy;
  }

  function spyFromMosaicConfig(
    gatewayAddresses: GatewayAddresses,
  ): SinonStub<[MosaicConfig, number], GatewayAddresses> {
    const spy = sinon.stub(
      GatewayAddresses,
      'fromMosaicConfig',
    ).callsFake(
      sinon.fake.returns(gatewayAddresses),
    );
    return spy;
  }

  it('should pass with valid arguments', () => {
    const mosaicFromFileSpy = spyMosaicfromFile(mosaic);
    const dummyGatewayAddresses = sinon.createStubInstance(GatewayAddresses);
    const fromMosaicConfigSpy = spyFromMosaicConfig(dummyGatewayAddresses);

    const {
      originChainId,
      gatewayAddresses,
    } = FacilitatorInit.getFromMosaicConfig(auxChain, mosaicConfigPath);

    SpyAssert.assert(fromMosaicConfigSpy, 1, [[mosaic, auxChain]]);
    SpyAssert.assert(mosaicFromFileSpy, 1, [[mosaicConfigPath]]);

    assert.strictEqual(
      originChainId,
      originChain,
      `Expected origin chain id is ${originChain} but got ${originChainId}`,
    );
    assert.strictEqual(
      gatewayAddresses,
      dummyGatewayAddresses,
      'GatewayAddresses object is different',
    );

    sinon.restore();
  });

  it('should fail when aux chain is not present in mosaic config', () => {
    const mosaicFromFileSpy = spyMosaicfromFile(mosaic);

    const emptyObject = FacilitatorInit.getFromMosaicConfig(100, mosaicConfigPath);

    SpyAssert.assert(mosaicFromFileSpy, 1, [[mosaicConfigPath]]);
    assert.strictEqual(
      Object.keys(emptyObject).length === 0,
      true,
      'Object must be empty',
    );

    sinon.restore();
  });
});
