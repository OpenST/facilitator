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
import path from 'path';
import sinon from 'sinon';

import { FacilitatorConfig } from '../../src/Config/Config';
import Directory from '../../src/Directory';
import SpyAssert from '../test_utils/SpyAssert';

const chain = 1000;
const mosaicDirectoryPath = '.mosaic';
const facilitatorConfigPath = path.join(
  mosaicDirectoryPath,
  chain.toString(),
  Directory.MOSAIC_FACILITATOR_CONFIG,
);

describe('FacilitatorConfig.writeToFacilitatorConfig()', (): void => {
  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('should pass with valid arguments', (): void => {
    sinon.stub(
      Directory,
      'getMosaicDirectoryPath',
    ).returns(mosaicDirectoryPath);

    sinon.stub(
      fs,
      'ensureDirSync',
    );

    const writeFileSyncStub = sinon.stub(
      fs,
      'writeFileSync',
    );

    const existsSyncStub = sinon.stub(
      fs,
      'existsSync',
    ).returns(false);
    const fsConfig = FacilitatorConfig.fromChain(chain);
    existsSyncStub.restore();

    fsConfig.originChain = 'originChain';
    fsConfig.auxChainId = 2;
    fsConfig.chains = {};
    fsConfig.encryptedAccounts = {};

    const fsConfigJson = JSON.stringify(fsConfig, null, '    ');

    fsConfig.writeToFacilitatorConfig(chain);

    SpyAssert.assert(writeFileSyncStub, 1, [[facilitatorConfigPath, fsConfigJson]]);
  });
});
