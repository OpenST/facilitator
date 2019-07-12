import sinon from 'sinon';

import { Config } from '../../src/Config';
import Facilitator from '../../src/Facilitator';
import assert from '../test_utils/assert';

describe('Facilitator.constructor()', () => {
  it('should construct with correct parameters', async () => {
    const configStub = sinon.createStubInstance(Config);
    const facilitator = new Facilitator(configStub);

    assert(
      facilitator,
      'Invalid Facilitator object.',
    );

    assert.strictEqual(
      facilitator.config,
      configStub,
      'Config mismatch.',
    );

    sinon.restore();
  });
});
