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

import { FacilitatorConfig } from '../../../src/m0_facilitator/Config/Config';
import Utils from '../../../src/m0_facilitator/Utils';
import assert from '../../test_utils/assert';
import SpyAssert from '../../test_utils/SpyAssert';

describe('FacilitatorConfig.fromChain()', () => {
  const auxiliaryChain = 1000;
  const originChain = 'dev-origin';
  const dummyGatewayAddress = '0x34817AF7B685DBD8a360e8Bed3121eb03D56C9BD';
  const facilitatorConfigPath = 'test/Database/facilitator-config.json';
  const facilitatorDBPath = 'test/database/mosaic_facilitator.db';
  const config = `{"database":{"path":"${facilitatorDBPath}"}}`;

  let pathSpy: any;

  function spyUtils(): any {
    const utilsSpy = sinon.replace(
      Utils,
      'getJsonDataFromPath',
      sinon.fake.returns(JSON.parse(config)),
    );
    return utilsSpy;
  }

  function spyFsModule(status: boolean) {
    const fsSpy = sinon.replace(
      fs,
      'existsSync',
      sinon.fake.returns(status),
    );
    return fsSpy;
  }

  /**
   * Path.join is called twice in `fromChain` method. Args variable of spy for path.join method
   * contains parameters of both calls. Args is 2-dimensional array. We can access args of both
   * the calls above.
   * Examples:-
   *  - path.join('a')
   *  - path.join('d','e')
   * 1. args[0][0] refers to first call of path.join and its value is 'a'.
   * 2. args[1][0] refers to first parameter of second call for path.join. It would return 'd'.
   * 3. args[1][1] refers to second parameter of second call for path.join. It would return 'e'.
   */
  function assertPathSpy(
    spy: any,
  ) {
    assert.strictEqual(
      spy.callCount,
      2,
      `Expected call count is 2 but got ${spy.callCount}`,
    );

    // validating input parameters on first call of path.join
    assert.strictEqual(
      spy.args[0][1],
      '.mosaic',
      'Base path is incorrect',
    );

    // validating input parameters on second call of path.join
    assert.strictEqual(
      spy.args[1][0],
      facilitatorConfigPath,
      'Path is incorrect',
    );
    assert.strictEqual(
      spy.args[1][1],
      originChain,
      'Origin chain name is incorrect',
    );

    assert.strictEqual(
      spy.args[1][2],
      auxiliaryChain.toString(10),
      'Auxiliary chain name is incorrect',
    );

    assert.strictEqual(
      spy.args[1][3],
      `gateway-${dummyGatewayAddress}`,
      'Gateway folder name is incorrect',
    );

    assert.strictEqual(
      spy.args[1][4],
      'facilitator-config.json',
      'Facilitator config file name is incorrect',
    );
  }

  beforeEach(async () => {
    pathSpy = sinon.stub(
      path,
      'join',
    ).callsFake(sinon.fake.returns(facilitatorConfigPath));
  });

  afterEach(async () => {
    assertPathSpy(pathSpy);
  });

  it('should pass with valid arguments', () => {
    const fsSpy = spyFsModule(true);
    const utilsSpy = spyUtils();
    const facilitatorSpy = sinon.replace(
      FacilitatorConfig,
      'verifySchema',
      sinon.fake.returns(true),
    );

    const facilitatorConfig = FacilitatorConfig.fromChain(
      originChain,
      auxiliaryChain,
      dummyGatewayAddress,
    );

    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(facilitatorSpy, 1, [[JSON.parse(config)]]);
    SpyAssert.assert(utilsSpy, 1, [[facilitatorConfigPath]]);
    assert.strictEqual(
      facilitatorConfig.database.path,
      facilitatorDBPath,
      'Facilitator DB path is incorrect',
    );

    sinon.restore();
  });

  it('should fail when facilitator file path doesn\'t exists', () => {
    const fsSpy = spyFsModule(false);

    const facilitatorConfig = FacilitatorConfig.fromChain(
      originChain,
      auxiliaryChain,
      dummyGatewayAddress,
    );

    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);

    assert.strictEqual(
      facilitatorConfig.database.path,
      undefined,
      'Facilitator DB path is incorrect',
    );

    sinon.restore();
  });

  it('should fail when verifySchema throws exception', () => {
    const fsSpy = spyFsModule(true);
    const utilsSpy = spyUtils();
    const facilitatorSpy = sinon.replace(
      FacilitatorConfig,
      'verifySchema',
      sinon.fake.throws('invalid facilitator config'),
    );

    assert.throws(
      () => FacilitatorConfig.fromChain(originChain, auxiliaryChain, dummyGatewayAddress),
      'invalid facilitator config',
    );
    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(facilitatorSpy, 1, [[JSON.parse(config)]]);
    SpyAssert.assert(utilsSpy, 1, [[facilitatorConfigPath]]);

    sinon.restore();
  });
});
