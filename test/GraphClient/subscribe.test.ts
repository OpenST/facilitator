'use strict';

const sinon = require('sinon');
import { assert } from 'chai'
import { createMockClient } from 'mock-apollo-client';

import AssertAsync from './../utils/AssertAsync'
import GraphClient from './../../src/GraphClient'

describe('GraphClient.subscribe()', () => {
  let graphClient;
  let subscriptionQry;
  let apolloClient;

  beforeEach(() => {
    apolloClient = createMockClient();
    graphClient = new GraphClient(apolloClient);
    subscriptionQry = 'subscription{stakeRequesteds{id}}';
  });

  it('should work with correct parameters', async () => {
    const spySubscribe = sinon.replace(
      apolloClient,
      'subscribe',
      sinon.fake.returns({
        subscribe: () => Promise.resolve(true)
      }),
    );
    const querySubscriber = await graphClient.subscribe(subscriptionQry);
    assert(querySubscriber);

    sinon.restore();
  });

  it('should throw an error when subscriptionQry is undefined object', async () => {
    const errorMessage = "Mandatory Parameter 'subscriptionQry' is missing or invalid.";
    await AssertAsync.reject(graphClient.subscribe(undefined), errorMessage);
  });

});
