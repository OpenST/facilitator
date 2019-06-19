'use strict';

const sinon = require('sinon');
import { assert } from 'chai'
import { Subscription } from 'apollo-client/util/Observable';

import Spy from './../utils/SpyAssert'
import AssertAsync from './../utils/AssertAsync'
import GraphClient from './../../src/GraphClient'

describe('GraphClient.subscribe()', () => {
  let graphClient;
  let subscriptionQry;

  beforeEach(() => {
    const subgraphEndPoint = '/subgraph/v1/subgraph1';
    graphClient = new GraphClient(subgraphEndPoint);
    subscriptionQry = 'subscription{stakeRequesteds{id}}';
  });

  it('should work with correct parameters', async () => {
    const spyGetClient = sinon.replace(
      graphClient,
      'getClient',
      sinon.fake.resolves(true),
    );
    const spySubscribe = sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(true),
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
