import { assert } from 'chai';
import { Chain, Config } from '../../src/Config';
import SpyAssert from '../test_utils/SpyAssert';

const Web3 = require('web3');

const sinon = require('sinon');

describe('Config.originWeb3', () => {
  let config: Config; let chain: Chain;

  beforeEach(() => {
    const mosaicConfigPath = 'test/Facilitator/testdata/mosaic-config.json';
    const facilitatorConfigPath = 'test/FacilitatorConfig/testdata/facilitator-config.json';
    config = Config.fromFile(mosaicConfigPath, facilitatorConfigPath);
    chain = config.facilitator.chains[config.facilitator.originChain];
  });

  it('should return web3 instance', () => {
    const web3 = new Web3();
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
