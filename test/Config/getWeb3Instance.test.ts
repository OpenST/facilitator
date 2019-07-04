import { assert } from 'chai';
import { Config, ENV_WORKER_PASSWORD_PREFIX } from '../../src/Config';
import SpyAssert from '../utils/SpyAssert';

import Account from '../../src/Account';

const Web3 = require('web3');

const sinon = require('sinon');

describe('config.originWeb3 and config.auxiliaryWeb3', () => {
  let mosaicConfigPath: string; let
    facilitatorConfigPath: string;

  beforeEach(() => {
    mosaicConfigPath = 'test/Facilitator/testdata/mosaic-config.json';
    facilitatorConfigPath = 'test/FacilitatorConfig/testdata/facilitator-config.json';
  });

  it('should throw for originWeb3 when password for origin worker is not set in ENV variables', () => {
    const config = Config.getConfigFromPath(mosaicConfigPath, facilitatorConfigPath);
    assert.throws(
      () => config.originWeb3,
      'password not found',
    );
  });

  it('should throw for auxiliaryWeb3 when password for auxiliary worker is not set in ENV variables', () => {
    const config = Config.getConfigFromPath(mosaicConfigPath, facilitatorConfigPath);
    assert.throws(
      () => config.auxiliaryWeb3,
      'password not found',
    );
  });

  it('should pass when password is available in ENV variables', () => {
    const unlockAccountSpy = sinon.replace(
      Account.prototype,
      'unlock',
      sinon.fake.returns(true),
    );

    const config = Config.getConfigFromPath(mosaicConfigPath, facilitatorConfigPath);

    const originChainConfig = config.facilitator.chains[config.facilitator.originChainId];
    const envVariableNameForOriginWorkerPassword = `${ENV_WORKER_PASSWORD_PREFIX}${originChainConfig.worker}`;
    process.env[envVariableNameForOriginWorkerPassword] = '123';

    assert.instanceOf(
      config.originWeb3,
      Web3,
      'originWeb3 should be an instance of Web3',
    );

    const auxChainConfig = config.facilitator.chains[config.facilitator.auxiliaryChainId];
    const envVariableNameForAuxiliaryWorkerPassword = `${ENV_WORKER_PASSWORD_PREFIX}${auxChainConfig.worker}`;
    process.env[envVariableNameForAuxiliaryWorkerPassword] = '123';

    assert.instanceOf(
      config.auxiliaryWeb3,
      Web3,
      'auxiliaryWeb3 should be an instance of Web3',
    );

    SpyAssert.assert(unlockAccountSpy, 2, [
      [config.originWeb3, originChainConfig.password],
      [config.auxiliaryWeb3, auxChainConfig.password],
    ]);

    process.env[envVariableNameForOriginWorkerPassword] = undefined;
    process.env[envVariableNameForAuxiliaryWorkerPassword] = undefined;

    sinon.restore();
  });
});
