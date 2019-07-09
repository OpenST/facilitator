import gql from 'graphql-tag';
import * as sinon from 'sinon';
import { Observer } from 'apollo-client/util/Observable';
import ApolloClient from 'apollo-client';
import assert from '../test_utils/assert';

import GraphClient from '../../src/GraphClient';
import SpyAssert from '../test_utils/SpyAssert';
import TransactionHandler from '../../src/TransactionHandler';
import TransactionFetcher from '../../src/TransactionFetcher';
import { ContractEntityRepository } from '../../src/repositories/ContractEntityRepository';

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
    const transactions: object[] = [];
    const subscriptionData = {
      data: {},
    };
    const mockQuerySubscriber = {
      subscribe: (fakeObserver: Observer<any>) => {
        if (fakeObserver.next) fakeObserver.next(subscriptionData);
        return sinon.fake();
      },
    };
    const mockApolloClientWithFakeSubscriber = sinon.createStubInstance(ApolloClient);
    const spyMethod = sinon.replace(
      mockApolloClientWithFakeSubscriber,
      'subscribe',
      sinon.fake.returns(mockQuerySubscriber) as any,
    );
    graphClient = new GraphClient(mockApolloClientWithFakeSubscriber as any);
    const handler = sinon.createStubInstance(TransactionHandler);
    const fetcher = sinon.createStubInstance(TransactionFetcher);
    const fetcherSpy = sinon.replace(
      fetcher,
      'fetch',
      sinon.fake.resolves(transactions) as any,
    );
    const contractEntityRepository = sinon.mock(ContractEntityRepository);
    const querySubscriber = await graphClient.subscribe(
      subscriptionQry,
      handler as any,
      fetcher as any,
      contractEntityRepository as any,
    );

    assert(
      querySubscriber,
      'Invalid query subscription object.',
    );

    SpyAssert.assert(
      spyMethod,
      1,
      [[options]],
    );

    SpyAssert.assert(
      fetcherSpy,
      1,
      [[subscriptionData.data]],
    );

    SpyAssert.assert(
      handler.handle,
      1,
      [[transactions]],
    );

    sinon.restore();
  });

  it('should throw an error when subscriptionQry is undefined object', async () => {
    const handler = sinon.mock(TransactionHandler);
    const fetcher = sinon.mock(TransactionFetcher);
    const contractEntityRepository = sinon.mock(ContractEntityRepository);
    assert.isRejected(
      graphClient.subscribe(
        undefined as any,
        handler as any,
        fetcher as any,
        contractEntityRepository as any,
      ),
      'Mandatory Parameter \'subscriptionQry\' is missing or invalid.',
      'Invalid subscriptionQry',
    );
  });
});
