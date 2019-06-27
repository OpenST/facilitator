import * as fs from 'fs-extra';
import * as path from 'path';
import Directory from '../../src/Directory';
import SpyAssert from "../utils/SpyAssert";
import { FacilitatorConfig } from "../../src/Config";
import {assert} from 'chai';

const sinon = require('sinon');

describe('FacilitatorConfig.isFacilitatorConfigPresent()', function () {
  const chain = '301';
  const facilitatorConfigPath = 'test/Database/facilitator-config.json';
  const mosaicDirectoryPath = '.mosaic';
  let pathSpy:any, directorySpy:any, fsSpy:any;

  function spyFsModule(fileSize: number): any {
    const fsSpy: any = sinon.replace(
      fs,
      'statSync',
      sinon.fake.returns({size: fileSize}),
    );
    return fsSpy;
  }

  beforeEach(async () => {
    pathSpy = sinon.stub(
      path,
      'join'
    ).callsFake(sinon.fake.returns(facilitatorConfigPath));

    directorySpy = sinon.stub(
      Directory,
      'getMosaicDirectoryPath'
    ).callsFake(sinon.fake.returns(mosaicDirectoryPath));
  });

  it('should pass with valid arguments', function () {
    const fileSize: number = 1;
    fsSpy = spyFsModule(fileSize);

    const status:boolean = FacilitatorConfig.isFacilitatorConfigPresent(chain);
    SpyAssert.assert(directorySpy, 1,[[]]);
    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(pathSpy,1 , [[mosaicDirectoryPath, chain, 'facilitator-config.json']])
    assert.strictEqual(
      status,
      true,
      `Facilitator config for ${chain} should be present`
    );

    pathSpy.restore();
    directorySpy.restore();
    sinon.restore();
  });

  it('should fail when file is empty', function () {
    const fileSize: number = 0;
    const fsSpy:any = spyFsModule(fileSize);

    const status:boolean = FacilitatorConfig.isFacilitatorConfigPresent(chain);

    SpyAssert.assert(directorySpy, 1,[[]]);
    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(pathSpy,1 , [[mosaicDirectoryPath, chain, 'facilitator-config.json']])
    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);

    assert.strictEqual(
      status,
      false,
      `Facilitator config for chain ${chain} should not be present`
    );

    pathSpy.restore();
    directorySpy.restore();
    sinon.restore();
  });
});
