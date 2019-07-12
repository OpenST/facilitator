import { assert } from 'chai';
import * as sinon from 'sinon';
import MosaicConfig from '../../src/MosaicConfig';
import { Config, FacilitatorConfig } from '../../src/Config';
import SpyAssert from '../test_utils/SpyAssert';


describe('Config.fromFile()', () => {
  const mosaicConfigPath = 'test/Config/mosaic-config.json';
  const facilitatorConfigPath = 'test/Config/facilitator-config.json';

  it('should pass with valid arguments', () => {
    const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = FacilitatorConfig.fromChain(3);

    const mosaicConfigSpy = sinon.replace(
      MosaicConfig,
      'fromFile',
      sinon.fake.returns(mosaic),
    );

    const facilitatorConfigSpy = sinon.replace(
      FacilitatorConfig,
      'fromFile',
      sinon.fake.returns(facilitator),
    );

    const config = Config.fromFile(mosaicConfigPath, facilitatorConfigPath);

    SpyAssert.assert(mosaicConfigSpy, 1, [[mosaicConfigPath]]);
    SpyAssert.assert(facilitatorConfigSpy, 1, [[facilitatorConfigPath]]);
    assert.strictEqual(
      config.facilitator,
      facilitator,
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
