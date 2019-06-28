import * as sinon from 'sinon';
import assert from '../utils/assert';

import Subscriber from '../../src/Subscriber';
import GraphClient from '../../src/GraphClient';

describe('Subscriber.unsubscribe()', () => {
  let mockApolloClient: any;
  let graphClient: GraphClient;
  let subscriptionQueries: Record<string, string>;
  let subscriber: Subscriber;
  let mockUnsubscribe: any;

  beforeEach(() => {
    mockApolloClient = sinon.stub;
    graphClient = new GraphClient(mockApolloClient);
    subscriptionQueries = { stakeRequested: 'subscription{stakeRequesteds{id}}' };
    mockUnsubscribe = {
      unsubscribe: sinon.spy,
    };
    sinon.replace(
      graphClient,
      'subscribe',
      sinon.fake.resolves(mockUnsubscribe),
    );
    subscriber = new Subscriber(graphClient, subscriptionQueries);
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
      subscriber.querySubscriptions.stakeRequested,
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
