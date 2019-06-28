import * as sinon from 'sinon';

import Facilitator from '../../src/Facilitator';
import GraphClient from '../../src/GraphClient';
import Subscriber from '../../src/Subscriber';
import { Config } from '../../src/Config';
import SpyAssert from '../utils/SpyAssert';

describe('Facilitator.stop()', () => {
  it('should stop facilitation', async () => {
    const mockGraphClient = sinon.createStubInstance(GraphClient);
    sinon.replace(
      GraphClient,
      'getClient',
      sinon.fake.returns(mockGraphClient),
    );
    const subscribeStub = sinon.stub(Subscriber.prototype, 'subscribe');

    const configStub = sinon.createStubInstance(Config);
    const facilitator = new Facilitator(configStub);
    await facilitator.start();

    const unSubscribeStub = sinon.stub(Subscriber.prototype, 'unsubscribe');
    await facilitator.stop();

    SpyAssert.assert(
      unSubscribeStub,
      2,
      [[], []],
    );

    subscribeStub.restore();
    unSubscribeStub.restore();
    sinon.restore();
  });
});
