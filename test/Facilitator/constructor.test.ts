import * as sinon from 'sinon';
import assert from '../test_utils/assert';

import Facilitator from '../../src/Facilitator';
import Subscriber from '../../src/subscriptions/Subscriber';

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
