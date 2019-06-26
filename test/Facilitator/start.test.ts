import * as sinon from 'sinon';

import Facilitator from '../../src/Facilitator';
import GraphClient from '../../src/GraphClient';
import Subscriber from '../../src/Subscriber';
import { Config } from '../../src/Config';
import SpyAssert from '../utils/SpyAssert';

describe('Facilitator.start()', () => {
  it('should work with correct parameters', async () => {
    const mockGraphClient = sinon.createStubInstance(GraphClient);
    const graphClientSpy = sinon.replace(
      GraphClient,
      'getClient',
      sinon.fake.returns(mockGraphClient),
    );
    const subscriberStub = sinon.stub(Subscriber.prototype, 'subscribe');

    const subGraphDetails = Facilitator.getSubscriptionDetails();
    const configStub = sinon.createStubInstance(Config);
    const facilitator = new Facilitator(configStub);
    await facilitator.start();

    SpyAssert.assert(
      graphClientSpy,
      2,
      [
        [subGraphDetails.origin.subGraphEndPoint],
        [subGraphDetails.auxiliary.subGraphEndPoint],
      ],
    );

    SpyAssert.assert(
      subscriberStub,
      2,
      [[], []],
    );

    subscriberStub.restore();
    sinon.restore();
  });
});
