import sinon from 'sinon';

import Facilitator from '../../src/Facilitator';
import Subscriber from '../../src/subscriptions/Subscriber';
import SpyAssert from '../test_utils/SpyAssert';

describe('Facilitator.start()', (): void => {
  it('should start facilitation', async (): Promise<void> => {
    const originSubscriber = sinon.createStubInstance(Subscriber);
    const auxiliarySubscriber = sinon.createStubInstance(Subscriber);

    const clock = sinon.useFakeTimers();
    const facilitator = new Facilitator(
      originSubscriber as any,
      auxiliarySubscriber as any,
    );
    await facilitator.start();
    SpyAssert.assert(originSubscriber.subscribe, 1, [[]]);
    SpyAssert.assert(auxiliarySubscriber.subscribe, 1, [[]]);
    clock.restore();
    sinon.restore();
  })
});
