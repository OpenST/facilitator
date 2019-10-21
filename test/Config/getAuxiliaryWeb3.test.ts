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

import { Chain, Config } from '../../src/Config/Config';
import SpyAssert from '../test_utils/SpyAssert';

describe('Config.auxiliaryWeb3', () => {
  let config: Config; let chain: Chain;

  beforeEach(() => {
    const mosaicConfigPath = 'testdata/mosaic.json';
    const facilitatorConfigPath = 'test/FacilitatorConfig/testdata/facilitator-config.json';
    config = Config.fromFile(facilitatorConfigPath, mosaicConfigPath);
    chain = config.facilitator.chains[config.facilitator.auxChainId];
  });

  it('should return web3 instance', () => {
    const web3 = new Web3(null);
    sinon.replace(
      config,
      'createWeb3Instance',
      sinon.fake.returns(web3),
    );
    const { auxiliaryWeb3 } = config;
    assert.strictEqual(
      auxiliaryWeb3,
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
