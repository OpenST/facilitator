'use strict';

import sinon from 'sinon'
import { assert } from  'chai'

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

  // it('should work with correct parameters', async () => {
  //   const sessionKey = '0x0000000000000000000000000000000000000003';
  //
  //   const mockSessionKeyData = 'mockSessionKeyData';
  //   const sessionKeyDataSpy = sinon.replace(
  //     tokenHolder.contract.methods,
  //     'sessionKeys',
  //     sinon.fake.returns({
  //       call: () => Promise.resolve(mockSessionKeyData)
  //     })
  //   );
  //   const response = await graphClient.subscribe(subscriptionQry);
  //
  //   assert.strictEqual(response, mockSessionKeyData);
  //   Spy.assert(sessionKeyDataSpy, 1, [[subscriptionQry]]);
  // });

  it('should throw an error when subscriptionQry is undefined object', async () => {
    const errorMessage = "Mandatory Parameter 'subscriptionQry' is missing or invalid.";
    await AssertAsync.reject(await graphClient.subscribe(subscriptionQry), errorMessage);
  });

});
