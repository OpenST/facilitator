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
  let subscriptionQueries;
  let subscriber;

  beforeEach(() => {
    apolloClient = createMockClient();
    graphClient = new GraphClient(apolloClient);
    subscriptionQueries = {stakeRequested: 'subscription{stakeRequesteds{id}}'};
    sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(new SpyUnsubscribe()),
    );
    subscriber = new Subscriber(graphClient, subscriptionQueries);
  });

  it('should work with correct parameters', async () => {
    const querySubscription = await subscriber.subscribe();
    assert.strictEqual(
      Object.keys(subscriber.querySubscriptions).length,
      1,
      "Subscription failed!!!"
    );
    sinon.replace(
      subscriber.querySubscriptions.stakeRequested,
      'unsubscribe',
      sinon.fake.resolves(true)
    );
    await subscriber.unsubscribe();
    assert.strictEqual(
      Object.keys(subscriber.querySubscriptions).length,
      0,
      "UnSubscription failed!!!"
    );

    sinon.restore();
  });

});
