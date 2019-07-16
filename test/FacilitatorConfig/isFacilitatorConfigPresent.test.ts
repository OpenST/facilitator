import fs from 'fs-extra';
import path from 'path';
import sinon from 'sinon';

import { FacilitatorConfig } from '../../src/Config/Config';
import Directory from '../../src/Directory';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

const sandbox = sinon.createSandbox();

let pathSpy: any;
let directorySpy: any;
let fsSpy: any;

async function spyFsModule(fileSize: number): Promise<any> {
  fsSpy = sandbox.stub(
    fs,
    'statSync',
  ).callsFake(sinon.fake.returns({ size: fileSize }));
}

describe('FacilitatorConfig.isFacilitatorConfigPresent()', (): void => {
  const chain = 301;
  const facilitatorConfigPath = 'test/Database/facilitator-config.json';
  const mosaicDirectoryPath = '.mosaic';


  beforeEach(async (): Promise<void> => {
    pathSpy = sandbox.stub(
      path,
      'join',
    ).returns(facilitatorConfigPath);

    directorySpy = sandbox.stub(
      Directory,
      'getMosaicDirectoryPath',
    ).returns(mosaicDirectoryPath);
  });

  afterEach(async (): Promise<void> => {
    sandbox.restore();
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
