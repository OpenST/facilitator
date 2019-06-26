import MosaicConfig from '../../src/MosaicConfig';
import {Config, FacilitatorConfig} from "../../src/Config";
import SpyAssert from "../utils/SpyAssert";
import {assert} from 'chai';

const sinon = require('sinon');

describe('Config.getConfig()', function () {
  const originChain = '2';
  const auxChain = '3';

  it('should pass with valid arguments', function () {
    const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = sinon.createStubInstance(FacilitatorConfig);

    const mosaicConfigSpy = sinon.replace(
      MosaicConfig,
      'fromChain',
      sinon.fake.returns(mosaic)
    );

    const facilitatorConfigSpy = sinon.replace(
      FacilitatorConfig,
      'from',
      sinon.fake.returns(facilitator)
    );

    const config = Config.getConfig(originChain, auxChain);
    SpyAssert.assert(mosaicConfigSpy, 1, [[originChain]]);
    SpyAssert.assert(facilitatorConfigSpy, 1, [[auxChain]]);
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
