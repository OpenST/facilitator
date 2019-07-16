import { assert } from 'chai';
import * as sinon from 'sinon';
import MosaicConfig from '../../src/MosaicConfig';
import { Config, FacilitatorConfig } from '../../src/Config/Config';
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
