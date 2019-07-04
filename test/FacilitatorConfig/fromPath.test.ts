import * as fs from 'fs-extra';

import { assert } from 'chai';
import * as sinon from 'sinon';
import Utils from '../../src/Utils';

import SpyAssert from '../utils/SpyAssert';
import { FacilitatorConfig } from '../../src/Config';

describe('FacilitatorConfig.fromPath()', () => {
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

  beforeEach(async () => {

  });

  it('should pass with valid arguments', () => {
    const originChain = '12346';
    const fsSpy = spyFsModule(true);
    const config = `{"originChainId":"${originChain}"}`;
    const data = JSON.parse(config);
    const fsUtils = spyUtils(data);

    const fcConfig: FacilitatorConfig = FacilitatorConfig.fromPath(facilitatorConfigPath);

    SpyAssert.assert(fsUtils, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    assert.strictEqual(
      fcConfig.originChainId,
      originChain,
      'origin chain id is different',
    );

    fsSpy.restore();
    fsUtils.restore();
    sinon.restore();
  });

  it('should return empty object when file path doesn\'t exists', () => {
    const fsSpy = spyFsModule(false);

    const fcConfig: FacilitatorConfig = FacilitatorConfig.fromPath(facilitatorConfigPath);

    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);

    assert.deepEqual(
      fcConfig.originChainId,
      '',
      ' it should be empty',
    );

    assert.deepEqual(
      fcConfig.auxiliaryChainId,
      '',
      ' it should be empty',
    );

    assert.deepEqual(
      fcConfig.database,
      {},
      ' it should be empty',
    );

    assert.deepEqual(
      fcConfig.chains,
      {},
      ' it should be empty',
    );

    assert.deepEqual(
      fcConfig.encryptedAccounts,
      {},
      ' it should be empty',
    );

    fsSpy.restore();
    sinon.restore();
  });
});
