import MosaicConfig from '../../src/MosaicConfig';
import {Config, FacilitatorConfig} from "../../src/Config";
import {assert} from 'chai';

const sinon = require('sinon');

describe('Config.constructor()', function () {

  it('should pass with valid arguments', function () {
    const mosaic = sinon.createStubInstance(MosaicConfig);
    const facilitator = sinon.createStubInstance(FacilitatorConfig);

    const config = new Config(mosaic, facilitator);

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
