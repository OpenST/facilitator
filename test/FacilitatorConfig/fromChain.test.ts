import * as fs from 'fs-extra';
import * as path from 'path';
import { assert } from 'chai';
import * as sinon from 'sinon';
import Utils from '../../src/Utils';
import SpyAssert from '../test_utils/SpyAssert';
import { FacilitatorConfig } from '../../src/Config';


describe('FacilitatorConfig.fromChain()', () => {
  const chain = '301';
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
    pathSpy: any,
  ) {
    assert.strictEqual(
      pathSpy.callCount,
      2,
      `Expected call count is 2 but got ${pathSpy.callCount}`,
    );

    // validating input parameters on first call of path.join
    assert.strictEqual(
      pathSpy.args[0][1],
      '.mosaic',
      'Base path is incorrect',
    );

    // validating input parameters on second call of path.join
    assert.strictEqual(
      pathSpy.args[1][0],
      facilitatorConfigPath,
      'Path is incorrect',
    );
    assert.strictEqual(
      pathSpy.args[1][1],
      chain,
      'Chain name is incorrect',
    );
    assert.strictEqual(
      pathSpy.args[1][2],
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

    const facilitatorConfig = FacilitatorConfig.fromChain(chain);

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

    const facilitatorConfig = FacilitatorConfig.fromChain(chain);

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

    assert.throws(() => FacilitatorConfig.fromChain(chain), 'invalid facilitator config');
    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(facilitatorSpy, 1, [[JSON.parse(config)]]);
    SpyAssert.assert(utilsSpy, 1, [[facilitatorConfigPath]]);

    sinon.restore();
  });
});
