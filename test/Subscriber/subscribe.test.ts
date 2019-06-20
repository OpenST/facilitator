'use strict';

const sinon = require('sinon');
import { assert } from 'chai'
import { createMockClient } from 'mock-apollo-client';

import Subscriber from './../../src/Subscriber'
import GraphClient from './../../src/GraphClient'

describe('Subscriber.subscribe()', () => {
  let apolloClient;
  let graphClient;
  let subscriptionQry;
  let subscriber;

  beforeEach(() => {
    apolloClient = createMockClient();
    graphClient = new GraphClient(apolloClient);
    subscriptionQry = 'subscription{stakeRequesteds{id}}';
  });

  it('should work with correct parameters', async () => {
    sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(true),
    );
    subscriber = new Subscriber(graphClient, [subscriptionQry]);
    await subscriber.subscribe();

    assert.strictEqual(
      subscriber.querySubscriptions.length,
      1,
      "Subscription failed!!!"
    );

    sinon.restore();
  });

});
