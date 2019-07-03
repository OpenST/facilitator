import { assert } from 'chai';
import * as sinon from 'sinon';

import Subscriber from '../../src/Subscriber';
import GraphClient from '../../src/GraphClient';
import TransactionHandler from '../../src/TransactionHandler';
import TransactionFetcher from "../../src/TransactionFetcher";

describe('Subscriber.unsubscribe()', () => {
  let mockApolloClient: any;
  let graphClient: GraphClient;
  let subscriptionQueries: Record<string, string>;
  let subscriber: Subscriber;
  let mockUnsubscribe: any;

  beforeEach(() => {
    mockApolloClient = sinon.stub;
    graphClient = new GraphClient(mockApolloClient);
    subscriptionQueries = { stakeRequesteds: 'subscription{stakeRequesteds{id}}' };
    mockUnsubscribe = {
      unsubscribe: sinon.spy,
    };
    sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(mockUnsubscribe),
    );
    const handler = sinon.mock(TransactionHandler);
    const fetcher = sinon.mock(TransactionFetcher);
    subscriber = new Subscriber(graphClient, subscriptionQueries, handler as any, fetcher as any);
  });

  it('should work with correct parameters', async () => {
    await subscriber.subscribe();

    assert.strictEqual(
      Object.keys(subscriber.querySubscriptions).length,
      1,
      'Subscription failed.',
    );

    const mockQuerySubscription = sinon.spy;
    sinon.replace(
      subscriber.querySubscriptions.stakeRequesteds,
      'unsubscribe',
      sinon.fake.resolves(mockQuerySubscription),
    );

    await subscriber.unsubscribe();
    assert.strictEqual(
      Object.keys(subscriber.querySubscriptions).length,
      0,
      'UnSubscription failed.',
    );

    sinon.restore();
  });
});
