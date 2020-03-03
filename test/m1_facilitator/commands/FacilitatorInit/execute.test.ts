// Copyright 2020 OpenST Ltd.
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

import sinon from 'sinon';
import fs from 'fs-extra';
import FacilitatorInit
  from '../../../../src/m1_facilitator/commands/FacilitatorInit';
import SeedDataInitializer
  from '../../../../src/m1_facilitator/SeedDataInitializer';
import SpyAssert from '../../../test_utils/SpyAssert';
import Directory from '../../../../src/m1_facilitator/Directory';
import assert from '../../../test_utils/assert';

describe('FacilitatorInit.execute', (): void => {
  const manifest = 'testdata/m1_facilitator/facilitator_manifest.yml';
  const testDBPath = 'testdata/m1_facilitator/test.db';
  let initializeSpy: any;
  let directorySpy: any;
  let facilitatorInit: FacilitatorInit;

  beforeEach((): void => {
    initializeSpy = sinon.replace(
      SeedDataInitializer.prototype,
      'initialize',
      sinon.fake.returns(true),
    );

    directorySpy = sinon.replace(
      Directory,
      'getFacilitatorDatabaseFile',
      sinon.fake.returns(testDBPath),
    );
    facilitatorInit = new FacilitatorInit(manifest, false);
  });
  it('should execute facilitator init', async (): Promise<void> => {
    await facilitatorInit.execute();

    SpyAssert.assert(directorySpy, 1, [['MOSAIC1', '0xA7f056b1320fE619571849f138Cd1Ae2f2e64179']]);
    SpyAssert.assertCall(initializeSpy, 1);
  });

  it('should fail to execute facilitator init if already initialized', async (): Promise<void> => {
    await facilitatorInit.execute();

    await assert.isRejected(
      facilitatorInit.execute(),
      `Database already initialized at location ${testDBPath}.`
      + ' Pass force option parameter for force init',
    );
  });

  it('should allow to execute facilitator init with force option', async (): Promise<void> => {
    await facilitatorInit.execute();
    facilitatorInit = new FacilitatorInit(manifest, true);
    await facilitatorInit.execute();
  });


  afterEach((): void => {
    fs.removeSync(testDBPath);
    sinon.restore();
  });
});
