import MosaicConfig from '../../src/MosaicConfig';
import {Config, FacilitatorConfig} from "../../src/Config";
import SpyAssert from "../utils/SpyAssert";
import {assert} from 'chai';

const sinon = require('sinon');

describe('Config.getConfigFromPath()', function () {
  const mosaicConfigPath = 'test/Config/mosaic-config.json';
  const facilitatorConfigPath = 'test/Config/facilitator-config.json';

  it('should pass with valid arguments', function () {
    const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = sinon.createStubInstance(FacilitatorConfig);

    const mosaicConfigSpy = sinon.replace(
      MosaicConfig,
      'fromFile',
      sinon.fake.returns(mosaic)
    );

    const facilitatorConfigSpy = sinon.replace(
      FacilitatorConfig,
      'fromPath',
      sinon.fake.returns(facilitator)
    );

    const config = Config.getConfigFromPath(mosaicConfigPath, facilitatorConfigPath);
    
    SpyAssert.assert(mosaicConfigSpy, 1, [[mosaicConfigPath]]);
    SpyAssert.assert(facilitatorConfigSpy, 1, [[facilitatorConfigPath]]);
    assert.strictEqual(
      config.facilitator,
      facilitator,
      'Facilitator object is different'
    );
    assert.strictEqual(
      config.mosaic,
      mosaic,
      'Mosaic object is different'
    );

    sinon.restore();
  });
});
