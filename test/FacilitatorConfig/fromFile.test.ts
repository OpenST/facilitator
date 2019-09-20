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
import Utils from '../../src/Utils';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

describe('FacilitatorConfig.fromFile()', () => {
  const facilitatorConfigPath = 'test/Database/facilitator-config.json';

  function spyFsModule(status: boolean): any {
    const fsSpy: any = sinon.stub(
      fs,
      'existsSync',
    ).callsFake(sinon.fake.returns(status));
    return fsSpy;
  }

  function spyUtils(data: any): any {
    const fsUtils: any = sinon.stub(
      Utils,
      'getJsonDataFromPath',
    ).callsFake(sinon.fake.returns(data));
    return fsUtils;
  }

  it('should pass with valid arguments', () => {
    const originChain = '12346';
    const fsSpy = spyFsModule(true);
    const config = `{"originChain":"${originChain}"}`;
    const data = JSON.parse(config);
    const fsUtils = spyUtils(data);

    sinon.stub(
      FacilitatorConfig,
      'verifySchema',
    );
    const fcConfig: FacilitatorConfig = FacilitatorConfig.fromFile(facilitatorConfigPath);

    SpyAssert.assert(fsUtils, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    assert.strictEqual(
      fcConfig.originChain,
      originChain,
      'origin chain id is different',
    );

    fsSpy.restore();
    fsUtils.restore();
    sinon.restore();
  });

  it('should throw exception when file path doesn\'t exists', () => {
    const fsSpy = spyFsModule(false);

    assert.throws(() => FacilitatorConfig.fromFile(
      facilitatorConfigPath,
    ),
    'File path doesn\'t exists');

    fsSpy.restore();
    sinon.restore();
  });
});
