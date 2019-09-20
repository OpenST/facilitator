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
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

let pathSpy: any;
let directorySpy: any;
let fsSpy: any;

async function spyFsModule(fileSize: number): Promise<any> {
  fsSpy = sinon.stub(
    fs,
    'statSync',
  ).callsFake(sinon.fake.returns({ size: fileSize }));
}

describe('FacilitatorConfig.isFacilitatorConfigPresent()', (): void => {
  const chain = 301;
  const facilitatorConfigPath = 'test/Database/facilitator-config.json';
  const mosaicDirectoryPath = '.mosaic';


  beforeEach(async (): Promise<void> => {
    pathSpy = sinon.stub(
      path,
      'join',
    ).returns(facilitatorConfigPath);

    directorySpy = sinon.stub(
      Directory,
      'getMosaicDirectoryPath',
    ).returns(mosaicDirectoryPath);
  });

  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('should pass with valid arguments', (): void => {
    const fileSize = 1;
    spyFsModule(fileSize);

    const status: boolean = FacilitatorConfig.isFacilitatorConfigPresent(chain);
    SpyAssert.assert(directorySpy, 1, [[]]);
    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(pathSpy, 1, [[mosaicDirectoryPath, chain.toString(), 'facilitator-config.json']]);
    assert.strictEqual(
      status,
      true,
      `Facilitator config for ${chain} should be present`,
    );
  });

  it('should fail when file is empty', (): void => {
    const fileSize = 0;
    spyFsModule(fileSize);

    const status: boolean = FacilitatorConfig.isFacilitatorConfigPresent(chain);

    SpyAssert.assert(directorySpy, 1, [[]]);
    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(pathSpy, 1, [[mosaicDirectoryPath, chain.toString(), 'facilitator-config.json']]);
    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);

    assert.strictEqual(
      status,
      false,
      `Facilitator config for chain ${chain} should not be present`,
    );
  });
});
