'use strict';

import gql from "graphql-tag";

const sinon = require('sinon');
import { assert } from 'chai'

import GraphClient from './../../src/GraphClient'
import SpyAssert from './../utils/SpyAssert'

describe('GraphClient.subscribe()', () => {
  let graphClient;
  let subscriptionQry;
  let mockApolloClient;
  let options;

  beforeEach(() => {
    mockApolloClient = {
      subscribe: sinon.stub(),
    };
    graphClient = new GraphClient(mockApolloClient);
    subscriptionQry = 'subscription{stakeRequesteds{id}}';
    options = {
      query: gql`${subscriptionQry}`,
      variables: {},
    }
  });

  it('should work with correct parameters', async () => {
    const mockQuerySubscriber = sinon.spy();
    const spyMethod = sinon.replace(
      mockApolloClient,
      'subscribe',
      sinon.fake.returns({
        subscribe: () => Promise.resolve(mockQuerySubscriber)
      }),
    );
    const querySubscriber = await graphClient.subscribe(subscriptionQry);

    assert(
      querySubscriber,
      "Invalid query subscription object!!!"
    );

    assert.strictEqual(
      querySubscriber,
      mockQuerySubscriber,
       "Invalid querySubscriber!!!"
    );

    SpyAssert.assert(
      spyMethod,
      1,
      [[options]]
    );

    sinon.restore();
  });

  it('should throw an error when subscriptionQry is undefined object', async () => {
    assert.throws(() => {
      graphClient.subscribe(undefined);
    }, /Mandatory Parameter 'subscriptionQry' is missing or invalid./);
  });

});
