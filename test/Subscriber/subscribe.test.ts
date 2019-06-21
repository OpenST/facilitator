'use strict';

import {Config} from "../../src/Config";

const sinon = require('sinon');
import { assert } from 'chai'
import { createMockClient } from 'mock-apollo-client';
import { Subscription } from 'apollo-client/util/Observable';

import Subscriber from './../../src/Subscriber'
import GraphClient from './../../src/GraphClient'
import SpyAssert from './../utils/SpyAssert'

describe('Subscriber.subscribe()', () => {
  let apolloClient;
  let graphClient;
  let subscriptionQueries;
  let subscriber;

  beforeEach(() => {
    apolloClient = createMockClient();
    graphClient = new GraphClient(apolloClient);
    subscriptionQueries = {stakeRequested: 'subscription{stakeRequesteds{id}}'};
  });

  it('should work with correct parameters', async () => {
    const spyGraphClientSubscribe = sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(true),
    );
    subscriber = new Subscriber(graphClient, subscriptionQueries);
    await subscriber.subscribe();

    assert.strictEqual(
      Object.keys(subscriber.querySubscriptions).length,
      1,
      "Subscription failed!!!"
    );
    SpyAssert.assert(
      spyGraphClientSubscribe,
      1,
      [[subscriptionQueries.stakeRequested]]
    );

    sinon.restore();
  });

});
