import gql from 'graphql-tag';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { assert } = chai;

import * as sinon from 'sinon';

import GraphClient from '../../src/GraphClient';
import SpyAssert from '../utils/SpyAssert';
import TransactionHandler from "../../src/TransactionHandler";
import TransactionFetcher from "../../src/TransactionFetcher";

describe('GraphClient.subscribe()', () => {
  let graphClient: GraphClient;
  let subscriptionQry: string;
  let mockApolloClient: any;
  let options: Object;

  beforeEach(() => {
    mockApolloClient = {
      subscribe: sinon.stub(),
    };
    graphClient = new GraphClient(mockApolloClient);
    subscriptionQry = 'subscription{stakeRequesteds{id}}';
    options = {
      query: gql`${subscriptionQry}`,
      variables: {},
    };
  });

  it('should work with correct parameters', async () => {
    const mockQuerySubscriber = sinon.spy() as any;
    const spyMethod = sinon.replace(
      mockApolloClient,
      'subscribe',
      sinon.fake.returns({
        subscribe: () => Promise.resolve(mockQuerySubscriber),
      }),
    );
    const handler = sinon.mock(TransactionHandler);
    const fetcher = sinon.mock(TransactionFetcher);
    const querySubscriber = await graphClient.subscribe(
      subscriptionQry,
      handler as any,
      fetcher as any,
    );

    assert(
      querySubscriber,
      'Invalid query subscription object.',
    );

    assert.strictEqual(
      querySubscriber,
      mockQuerySubscriber,
      'Invalid querySubscriber.',
    );

    SpyAssert.assert(
      spyMethod,
      1,
      [[options]],
    );

    sinon.restore();
  });

  it('should throw an error when subscriptionQry is undefined object', async () => {
    const handler = sinon.mock(TransactionHandler);
    const fetcher = sinon.mock(TransactionFetcher);
    assert.isRejected(
      graphClient.subscribe(undefined as any, handler as any, fetcher as any,),
      'Mandatory Parameter \'subscriptionQry\' is missing or invalid.',
      'Invalid subscriptionQry',
    );
  });
});
