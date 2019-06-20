'use strict';

const sinon = require('sinon');
import { assert } from 'chai'
import { createMockClient } from 'mock-apollo-client';

import Subscriber from './../../src/Subscriber'
import GraphClient from './../../src/GraphClient'
import SpyUnsubscribe from './utils/SpyUnsubscribe'

describe('Subscriber.unsubscribe()', () => {
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
      sinon.fake.resolves(new SpyUnsubscribe()),
    );
    subscriber = new Subscriber(graphClient, [subscriptionQry]);
    await subscriber.subscribe();
    assert.strictEqual(
      subscriber.querySubscriptions.length,
      1,
      "Subscription failed!!!"
    );
    sinon.replace(
      subscriber.querySubscriptions[0],
      'unsubscribe',
      sinon.fake.resolves(true)
    );
    await subscriber.unsubscribe();
    assert.strictEqual(
      subscriber.querySubscriptions.length,
      0,
      "UnSubscription failed!!!"
    );

    sinon.restore();
  });

});
