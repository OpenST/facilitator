import sinon from 'sinon';

import GraphClient from '../../src/GraphClient';
import Subscriber from '../../src/Subscriber';
import TransactionFetcher from '../../src/TransactionFetcher';
import TransactionHandler from '../../src/TransactionHandler';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

describe('Subscriber.subscribe()', () => {
  let mockApolloClient: any;
  let graphClient: GraphClient;
  let subscriptionQueries: Record<string, string>;
  let subscriber: Subscriber;

  beforeEach(() => {
    mockApolloClient = sinon.stub;
    graphClient = new GraphClient(mockApolloClient);
    subscriptionQueries = { stakeRequesteds: 'subscription{stakeRequesteds{id}}' };
  });

  it('should work with correct parameters', async () => {
    const mockQuerySubscriber = sinon.spy as any;
    const spyGraphClientSubscribe = sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(mockQuerySubscriber),
    );
    const handler = sinon.mock(TransactionHandler);
    const fetcher = sinon.mock(TransactionFetcher);
    subscriber = new Subscriber(graphClient, subscriptionQueries, handler as any, fetcher as any);
    await subscriber.subscribe();

    assert.strictEqual(
      Object.keys(subscriber.querySubscriptions).length,
      1,
      'Subscription failed.',
    );

    assert.strictEqual(
      subscriber.querySubscriptions.stakeRequesteds,
      mockQuerySubscriber,
      'Invalid query subscription object.',
    );

    SpyAssert.assert(
      spyGraphClientSubscribe,
      1,
      [[subscriptionQueries.stakeRequesteds, handler, fetcher]],
    );

    sinon.restore();
  });
});
