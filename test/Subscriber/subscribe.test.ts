'use strict';

const sinon = require('sinon');
import { assert } from 'chai'

import Subscriber from './../../src/Subscriber'
import GraphClient from './../../src/GraphClient'
import SpyAssert from './../utils/SpyAssert'

describe('Subscriber.subscribe()', () => {
  let mockApolloClient;
  let graphClient;
  let subscriptionQueries;
  let subscriber;

  beforeEach(() => {
    mockApolloClient = sinon.stub;
    graphClient = new GraphClient(mockApolloClient);
    subscriptionQueries = {stakeRequested: 'subscription{stakeRequesteds{id}}'};
  });

  it('should work with correct parameters', async () => {
    const mockQuerySubscriber = sinon.spy;
    const spyGraphClientSubscribe = sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(mockQuerySubscriber),
    );
    subscriber = new Subscriber(graphClient, subscriptionQueries);
    await subscriber.subscribe();

    assert.strictEqual(
      Object.keys(subscriber.querySubscriptions).length,
      1,
      "Subscription failed!!!"
    );

    assert.strictEqual(
      subscriber.querySubscriptions.stakeRequested,
      mockQuerySubscriber,
      "Invalid query subscription object!!!"
    );

    SpyAssert.assert(
      spyGraphClientSubscribe,
      1,
      [[subscriptionQueries.stakeRequested]]
    );

    sinon.restore();
  });

});
