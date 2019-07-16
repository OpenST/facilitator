import * as fs from 'fs-extra';
import * as sinon from 'sinon';
import { FacilitatorConfig } from '../../src/Config/Config';
import Directory from '../../src/Directory';
import SpyAssert from '../test_utils/SpyAssert';

describe('FacilitatorConfig.remove()', () => {
  it('should remove facilitator config from default path', async () => {
    const someChain = 'someChain';

    const removeSyncStub = sinon.stub(
      fs,
      'removeSync',
    );
    const somePath = 'Some Path';
    const dirStub = sinon.replace(
      Directory,
      'getFacilitatorConfigPath',
      sinon.fake.returns(somePath),
    );
    FacilitatorConfig.remove(someChain);

    SpyAssert.assert(dirStub, 1, [[someChain]]);
    SpyAssert.assert(removeSyncStub, 1, [[somePath]]);
    sinon.restore();
  });
});
