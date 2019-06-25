import * as fs from 'fs-extra';
import * as path from 'path';
import Utils from '../../src/Utils';
import SpyAssert from "./../utils/SpyAssert";
import { FacilitatorConfig } from "../../src/Config";
import {assert} from 'chai';

const sinon = require('sinon');

describe('Facilitator.from()', function () {
  const chain = '301';
  const facilitatorConfigPath = 'test/Database/facilitator-config.json';
  const facilitatorDBPath = 'test/database/mosaic_facilitator.db';
  const config = `{"database":{"path":"${facilitatorDBPath}"}}`;

  let pathSpy:any;

  function spyFsModule(status: boolean) {
    const fsSpy = sinon.replace(
      fs,
      'existsSync',
      sinon.fake.returns(status),
    );
    return fsSpy;
  }

  function assertPathSpy(
    pathSpy: any
  ) {
    assert.strictEqual(
      pathSpy.callCount,
      2,
      `Expected call count is 2 but got ${pathSpy.callCount}`
    );

    // validating input parameters on first call of path.join
    assert.strictEqual(
      pathSpy.args[0][1],
      '.mosaic',
      'Base path is incorrect'
    );

    //validating input parameters on second call of path.join
    assert.strictEqual(
      pathSpy.args[1][0],
      facilitatorConfigPath,
      'Path is incorrect'
    );
    assert.strictEqual(
      pathSpy.args[1][1],
      chain,
      'Chain name is incorrect'
    );
    assert.strictEqual(
      pathSpy.args[1][2],
      'facilitator-config.json',
      'Facilitator config file name is incorrect'
    );
  }

  beforeEach(async () => {
    pathSpy = sinon.stub(
      path,
      'join'
    ).callsFake(sinon.fake.returns(facilitatorConfigPath));
  });

  afterEach(async () => {
    assertPathSpy(pathSpy);
  });

  it('should pass with valid arguments', function () {
    const fsSpy = spyFsModule(true);
    const utilsSpy = sinon.replace(
      Utils,
      'getJsonDataFromPath',
      sinon.fake.returns(JSON.parse(config))
    );
    const facilitatorSpy = sinon.replace(
      FacilitatorConfig,
      'validateSchema',
      sinon.fake.returns(true)
    );

    const facilitatorConfig = FacilitatorConfig.from(chain);

    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(facilitatorSpy,1, [[JSON.parse(config)]]);
    SpyAssert.assert(utilsSpy, 1, [[facilitatorConfigPath]]);
    assert.strictEqual(
      facilitatorConfig.database.path,
      facilitatorDBPath,
      'Facilitator DB path is incorrect'
    );

    sinon.restore();
  });

  it('should fail when facilitator file path doesn\'t exists', function () {
    const fsSpy = spyFsModule(false);

    const facilitatorConfig = FacilitatorConfig.from(chain);

    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);

    assert.strictEqual(
      facilitatorConfig.database.path,
      undefined,
      'Facilitator DB path is incorrect'
    );

    sinon.restore();
  });
});