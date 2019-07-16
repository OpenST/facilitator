import sinon from 'sinon';

import Facilitator from '../../src/Facilitator';
import Subscriber from '../../src/subscriptions/Subscriber';
import SpyAssert from '../test_utils/SpyAssert';

describe('Facilitator.stop()', (): void => {
  it('should stop facilitation', async (): Promise<void> => {
    const originSubscriber = sinon.createStubInstance(Subscriber);
    const auxiliarySubscriber = sinon.createStubInstance(Subscriber);

    const facilitator = new Facilitator(
      originSubscriber as any,
      auxiliarySubscriber as any,
    );
    await facilitator.stop();
    SpyAssert.assert(originSubscriber.unsubscribe, 1, [[]]);
    SpyAssert.assert(auxiliarySubscriber.unsubscribe, 1, [[]]);
  });
});
