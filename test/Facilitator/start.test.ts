'use strict';

import { assert } from  'chai'
const sinon = require('sinon');

import GraphClient from './../../src/GraphClient';
import { Config } from './../../src/Config'
import Facilitator from './../../src/Facilitator'
import SpyAssert from './../utils/SpyAssert'

describe('Facilitator.stop()', () => {
  let facilitator;

  it('should start facilitator gracefully', async () => {
    const subgraphEndPoint = '/subgraph/v1/subgraph1';
    const graphClient = new GraphClient(subgraphEndPoint);
    const spyGraphClientSubscribe = sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(true),
    );

    const configStub = sinon.createStubInstance(Config);
    const dbConnection = sinon.spy();
    facilitator = new Facilitator(configStub, dbConnection);

    await facilitator.start();
    sinon.restore();
  });

});
