'use strict';

import { assert } from  'chai'
const sinon = require('sinon');

import { Config } from './../../src/Config'
import Facilitator from './../../src/Facilitator'

describe('Facilitator.stop()', () => {
  let facilitator;

  it('should stop facilitator gracefully', async () => {
    const configStub = sinon.createStubInstance(Config);
    const dbConnection = sinon.spy();
    facilitator = new Facilitator(configStub, dbConnection);
    await facilitator.stop();

    sinon.restore();
  });

});
