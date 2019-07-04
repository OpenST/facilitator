import { assert } from 'chai';
import { Chain, Config, ENV_WORKER_PASSWORD_PREFIX } from '../../src/Config';
import SpyAssert from '../test_utils/SpyAssert';

import Account from '../../src/Account';

const Web3 = require('web3');

const sinon = require('sinon');

describe('Config.createWeb3Instance', () => {
  let config: Config; let chain: Chain;

  beforeEach(() => {
    const mosaicConfigPath = 'test/Facilitator/testdata/mosaic-config.json';
    const facilitatorConfigPath = 'test/FacilitatorConfig/testdata/facilitator-config.json';
    config = Config.getConfigFromPath(mosaicConfigPath, facilitatorConfigPath);
    chain = config.facilitator.chains[config.facilitator.originChainId];
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
