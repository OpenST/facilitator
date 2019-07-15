import * as fs from 'fs-extra';
import * as path from 'path';
import * as sinon from 'sinon';
import Directory from '../../src/Directory';
import SpyAssert from '../test_utils/SpyAssert';
import { FacilitatorConfig } from '../../src/Config/Config';


describe('FacilitatorConfig.writeToFacilitatorConfig()', () => {
  const chain = 301;
  const facilitatorConfigPath = 'test/Database/facilitator-config.json';
  const mosaicDirectoryPath = '.mosaic';

  function spyFsEnsureDirSync(): any {
    const fsSpy: any = sinon.replace(
      fs,
      'ensureDirSync',
      sinon.fake.returns(facilitatorConfigPath),
    );
    return fsSpy;
  }

  function spyFsWriteFileSync(): any {
    const fsSpy: any = sinon.replace(
      fs,
      'writeFileSync',
      sinon.fake.returns(true),
    );
    return fsSpy;
  }

  function spyPath(): any {
    const pathSpy = sinon.stub(
      path,
      'join',
    ).callsFake(sinon.fake.returns(facilitatorConfigPath));
    return pathSpy;
  }

  function spyDirectory(): any {
    const directorySpy = sinon.stub(
      Directory,
      'getMosaicDirectoryPath',
    ).callsFake(sinon.fake.returns(mosaicDirectoryPath));
    return directorySpy;
  }

  it('should pass with valid arguments', () => {
    const fsEnsureDirSyncSpy = spyFsEnsureDirSync();
    const fsWriteFileSyncSpy = spyFsWriteFileSync();
    sinon.replace(
      fs,
      'existsSync',
      sinon.fake.returns(false),
    );
    const fsConfig: FacilitatorConfig = FacilitatorConfig.fromChain(chain);
    const directorySpy = spyDirectory();
    const pathSpy = spyPath();

    fsConfig.writeToFacilitatorConfig(chain);

    const data = {
      originChain: '',
      auxChainId: '',
      database: {},
      chains: {},
      encryptedAccounts: {},
    };
    const objectWritten = JSON.stringify(data, null, '    ');

    SpyAssert.assert(directorySpy, 2, [[], []]);
    SpyAssert.assert(fsEnsureDirSyncSpy, 1, [[facilitatorConfigPath]]);

    SpyAssert.assert(fsWriteFileSyncSpy, 1, [[facilitatorConfigPath, objectWritten]]);
    SpyAssert.assert(pathSpy, 2, [
      [mosaicDirectoryPath, chain.toString()],
      [mosaicDirectoryPath, chain.toString(), 'facilitator-config.json'],
    ]);

    pathSpy.restore();
    directorySpy.restore();
    sinon.restore();
  });
});
