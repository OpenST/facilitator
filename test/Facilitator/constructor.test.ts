'use strict';

import { assert } from  'chai'
const sinon = require('sinon');

import { Config } from './../../src/Config'
import Facilitator from './../../src/Facilitator'

describe('Facilitator.constructor()', () => {
  let mosaicConfigPath;
  let facilitatorConfigPath;

  beforeEach(() => {
    mosaicConfigPath =  './path1';
    facilitatorConfigPath =  './path2';
  });

  it('should construct with correct parameters', async () => {
    //const spyConfig = new SpyConfig(mosaicConfigPath, facilitatorConfigPath);
    const configStub = sinon.createStubInstance(Config);
    const dbConnection = sinon.spy();
    const facilitator = new Facilitator(configStub, dbConnection);

    assert(facilitator);
  });

});
