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


import { assert } from 'chai';
import sinon from 'sinon';
import Web3 from 'web3';

import { Chain, Config, ConfigType } from '../../../src/m0-facilitator/Config/Config';
import SpyAssert from '../../test_utils/SpyAssert';

describe('Config.originWeb3', () => {
  let config: Config; let chain: Chain;

  beforeEach(() => {
    const mosaicConfigPath = 'testdata/m0-facilitator/mosaic.json';
    const facilitatorConfigPath = 'test/m0-facilitator/FacilitatorConfig/testdata/facilitator-config.json';
    config = Config.fromFile(facilitatorConfigPath, mosaicConfigPath, ConfigType.MOSAIC);
    chain = config.facilitator.chains[config.facilitator.originChain];
  });

  it('should return web3 instance', () => {
    const web3 = new Web3(null);
    sinon.replace(
      config,
      'createWeb3Instance',
      sinon.fake.returns(web3),
    );
    const { originWeb3 } = config;
    assert.strictEqual(
      originWeb3,
      web3,
      'should return web3',
    );
    SpyAssert.assert(
      config.createWeb3Instance,
      1,
      [[chain]],
    );
  });
});
