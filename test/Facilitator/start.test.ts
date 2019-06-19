'use strict';

import { assert } from  'chai'
const sinon = require('sinon');
import { createMockClient } from 'mock-apollo-client';

import GraphClient from './../../src/GraphClient';
import { Config } from './../../src/Config'
import Facilitator from './../../src/Facilitator'

describe('Facilitator.start()', () => {
  it('should start facilitator gracefully', async () => {
    const apolloClient = createMockClient();
    const graphClient = new GraphClient(apolloClient);
    const spySubscribe = sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(true),
    );

    const configStub = sinon.createStubInstance(Config);
    const dbConnection = sinon.spy();
    const facilitator = new Facilitator(configStub, dbConnection);

    await facilitator.start(graphClient, graphClient);
    sinon.restore();
  });

});
