import * as sinon from 'sinon';

import StakeRequestedHandler
  from '../../../src/handlers/StakeRequestedHandler';
import {
  StakeRequestAttributes,
  StakeRequestRepository,
} from '../../../src/models/StakeRequestRepository';
import StubData from '../../utils/StubData';
import SpyAssert from '../../utils/SpyAssert';

describe('StakeRequestedHandler.handle()', () => {
  it('should handle successfully', () => {
    const bulkCreateStub = sinon.stub();
    const sinonMock = sinon.createStubInstance(StakeRequestRepository,
      {
        bulkCreate: bulkCreateStub as any,
      });
    const handler = new StakeRequestedHandler(sinonMock as any);

    const stakeRequestAttributes: StakeRequestAttributes [] = [
      StubData.getAStakeRequest('stakeRequestHash1'),
      StubData.getAStakeRequest('stakeRequestHash2'),
      StubData.getAStakeRequest('stakeRequestHash3'),
    ];
    handler.handle(stakeRequestAttributes);
    SpyAssert.assert(bulkCreateStub, 1, [[stakeRequestAttributes]]);
  });
});
