import sinon from 'sinon';

import Facilitator from '../../src/Facilitator';
import Subscriber from '../../src/subscriptions/Subscriber';
import assert from '../test_utils/assert';

describe('Facilitator.constructor()', () => {
  it('should construct with correct parameters', async () => {
    const originSubscriber = sinon.createStubInstance(Subscriber);
    const auxiliarySubscriber = sinon.createStubInstance(Subscriber);

    const facilitator = new Facilitator(
      originSubscriber as any,
      auxiliarySubscriber as any,
    );

    assert(
      facilitator,
      'Invalid Facilitator object.',
    );
  });
});
