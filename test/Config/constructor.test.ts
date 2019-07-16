import { assert } from 'chai';
import * as sinon from 'sinon';
import MosaicConfig from '../../src/MosaicConfig';
import { Config } from '../../src/Config/Config';


describe('Config.constructor()', () => {
  it('should pass with valid arguments', () => {
    const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = sinon.fake() as any;
    const config = new Config(mosaic, facilitator);

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
