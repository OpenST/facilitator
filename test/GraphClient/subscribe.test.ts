import gql from 'graphql-tag';
import sinon from 'sinon';

import GraphClient from '../../src/GraphClient';
import TransactionFetcher from '../../src/TransactionFetcher';
import TransactionHandler from '../../src/TransactionHandler';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

describe('GraphClient.subscribe()', () => {
  let graphClient: GraphClient;
  let subscriptionQry: string;
  let mockApolloClient: any;
  let options: Record<string, any>;

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
        subscribe: async () => Promise.resolve(mockQuerySubscriber),
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
      graphClient.subscribe(undefined as any, handler as any, fetcher as any),
      'Mandatory Parameter \'subscriptionQry\' is missing or invalid.',
      'Invalid subscriptionQry',
    );
  });
});
