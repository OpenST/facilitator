import sinon from 'sinon';

import { Config } from '../../src/Config';
import MosaicConfig from '../../src/MosaicConfig';
import assert from '../test_utils/assert';

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
