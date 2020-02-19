// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------


import sinon from 'sinon';

import ContractEntityRepository from '../../../../src/m0-facilitator/repositories/ContractEntityRepository';
import GraphClient from '../../../../src/m0-facilitator/subscriptions/GraphClient';
import Subscriber from '../../../../src/m0-facilitator/subscriptions/Subscriber';
import TransactionFetcher from '../../../../src/m0-facilitator/subscriptions/TransactionFetcher';
import TransactionHandler from '../../../../src/m0-facilitator/TransactionHandler';
import assert from '../../../test_utils/assert';

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
    const contractEntityRepository = sinon.mock(ContractEntityRepository);
    subscriber = new Subscriber(
      graphClient,
      subscriptionQueries,
      handler as any,
      fetcher as any,
      contractEntityRepository as any,
    );
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
