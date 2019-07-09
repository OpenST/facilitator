import * as fs from 'fs-extra';

import { assert } from 'chai';
import * as sinon from 'sinon';
import Utils from '../../src/Utils';

import SpyAssert from '../test_utils/SpyAssert';
import { FacilitatorConfig } from '../../src/Config';

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
      facilitatorConfigPath),
      'File path doesn\'t exists'
    );

    fsSpy.restore();
    sinon.restore();
  });
});
