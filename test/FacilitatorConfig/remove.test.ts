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


import fs from 'fs-extra';
import sinon from 'sinon';

import { FacilitatorConfig } from '../../src/Config/Config';
import Directory from '../../src/Directory';
import SpyAssert from '../test_utils/SpyAssert';

describe('FacilitatorConfig.remove()', () => {
  it('should remove facilitator config from default path', async () => {
    const someChain = 300;

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
