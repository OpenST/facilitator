'use strict';

const sinon = require('sinon');
import { assert } from 'chai'

import Subscriber from './../../src/Subscriber'
import GraphClient from './../../src/GraphClient'

describe('Subscriber.unsubscribe()', () => {
  let mockApolloClient;
  let graphClient;
  let subscriptionQueries;
  let subscriber;
  let mockUnsubscribe;

  beforeEach(() => {
    mockApolloClient = sinon.stub;
    graphClient = new GraphClient(mockApolloClient);
    subscriptionQueries = {stakeRequested: 'subscription{stakeRequesteds{id}}'};
    mockUnsubscribe = {
      unsubscribe: sinon.spy,
    };
    sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(mockUnsubscribe),
    );
    subscriber = new Subscriber(graphClient, subscriptionQueries);
  });

  it('should work with correct parameters', async () => {
    await subscriber.subscribe();

    assert.strictEqual(
      Object.keys(subscriber.querySubscriptions).length,
      1,
      "Subscription failed!!!"
    );

    const mockQuerySubscription = sinon.spy;
    sinon.replace(
      subscriber.querySubscriptions.stakeRequested,
      'unsubscribe',
      sinon.fake.resolves(mockQuerySubscription)
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
