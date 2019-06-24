import { assert } from 'chai';
import * as sinon from 'sinon';

import Subscriber from '../../src/Subscriber';
import GraphClient from '../../src/GraphClient';
import SpyAssert from '../utils/SpyAssert';

describe('Subscriber.subscribe()', () => {
  let mockApolloClient: any;
  let graphClient: GraphClient;
  let subscriptionQueries: Record<string, string>;
  let subscriber: Subscriber;

  beforeEach(() => {
    mockApolloClient = sinon.stub;
    graphClient = new GraphClient(mockApolloClient);
    subscriptionQueries = { stakeRequested: 'subscription{stakeRequesteds{id}}' };
  });

  it('should work with correct parameters', async () => {
    const mockQuerySubscriber = sinon.spy as any;
    const spyGraphClientSubscribe = sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(mockQuerySubscriber),
    );
    subscriber = new Subscriber(graphClient, subscriptionQueries);
    await subscriber.subscribe();

    assert.strictEqual(
      Object.keys(subscriber.querySubscriptions).length,
      1,
      'Subscription failed.',
    );

    assert.strictEqual(
      subscriber.querySubscriptions.stakeRequested,
      mockQuerySubscriber,
      'Invalid query subscription object.',
    );

    SpyAssert.assert(
      spyGraphClientSubscribe,
      1,
      [[subscriptionQueries.stakeRequested]],
    );

    sinon.restore();
  });
});
