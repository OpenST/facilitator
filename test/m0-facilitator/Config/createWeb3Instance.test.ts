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
import Web3 from 'web3';

import Account from '../../../src/m0-facilitator/Account';
import {
  Chain, Config, ConfigType, ENV_WORKER_PASSWORD_PREFIX,
} from '../../../src/m0-facilitator/Config/Config';
import assert from '../../test_utils/assert';
import SpyAssert from '../../test_utils/SpyAssert';

describe('Config.createWeb3Instance', () => {
  let config: Config; let chain: Chain;

  beforeEach(() => {
    const mosaicConfigPath = 'testdata/mosaic.json';
    const facilitatorConfigPath = 'test/m0-facilitator/FacilitatorConfig/testdata/facilitator-config.json';
    config = Config.fromFile(facilitatorConfigPath, mosaicConfigPath, ConfigType.MOSAIC);
    chain = config.facilitator.chains[config.facilitator.originChain];
  });

  it('should throw when password for worker is not set in ENV variables', () => {
    assert.throws(
      () => config.createWeb3Instance(
        chain,
      ),
      'password not found',
    );
  });

  it('should pass when password is available in ENV variables', () => {
    const unlockAccountSpy = sinon.replace(
      Account.prototype,
      'unlock',
      sinon.fake.returns(true),
    );
    const envVariableNameForWorkerPassword = `${ENV_WORKER_PASSWORD_PREFIX}${chain.worker}`;
    process.env[envVariableNameForWorkerPassword] = '123';

    const web3 = config.createWeb3Instance(chain);
    assert.instanceOf(
      web3,
      Web3,
      'web3 should be an instance of Web3',
    );

    SpyAssert.assert(unlockAccountSpy, 1, [
      [web3, chain.password],
    ]);

    process.env[envVariableNameForWorkerPassword] = undefined;

    sinon.restore();
  });
});
