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

import { Config, FacilitatorConfig } from '../../src/Config/Config';
import MosaicConfig from "@openst/mosaic-chains/lib/src/Config/MosaicConfig";
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

describe('Config.fromChain()', () => {
  const originChain = '2';
  const auxChain = 3;

  it('should pass with valid arguments', () => {
    const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = sinon.fake(FacilitatorConfig);

    const mosaicConfigSpy = sinon.replace(
      MosaicConfig,
      'fromChain',
      sinon.fake.returns(mosaic),
    );

    const facilitatorConfigSpy = sinon.replace(
      FacilitatorConfig,
      'fromChain',
      sinon.fake.returns(facilitator),
    );

    const config = Config.fromChain(originChain, auxChain);
    SpyAssert.assert(mosaicConfigSpy, 1, [[originChain]]);
    SpyAssert.assert(facilitatorConfigSpy, 1, [[auxChain]]);
    assert.strictEqual(
      config.facilitator,
      facilitator as any,
      'Facilitator object is different',
    );
    assert.strictEqual(
      config.mosaic,
      mosaic,
      'Mosaic object is different',
    );

    sinon.restore();
  });
});
