'use strict';

import { assert } from  'chai'
const sinon = require('sinon');

import { Config } from './../../src/Config'
import Facilitator from './../../src/Facilitator'

describe('Facilitator.constructor()', () => {

  it('should construct with correct parameters', async () => {
    const configStub = sinon.createStubInstance(Config);
    const facilitator = new Facilitator(configStub);

    assert(
      facilitator,
      "Invalid Facilitator object!!!"
    );

    assert.strictEqual(
      facilitator.config,
      configStub,
      "Config mismatch!!!"
    );

    sinon.restore();
  });

});
