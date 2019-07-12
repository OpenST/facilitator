import fs from 'fs-extra';
import path from 'path';
import sinon from 'sinon';

import { FacilitatorConfig } from '../../src/Config';
import Directory from '../../src/Directory';
import SpyAssert from '../test_utils/SpyAssert';

const sandbox = sinon.createSandbox();

const chain = '301';
const facilitatorConfigPath = 'test/Database/facilitator-config.json';
const mosaicDirectoryPath = '.mosaic';

describe('FacilitatorConfig.writeToFacilitatorConfig()', (): void => {
  it('should pass with valid arguments', (): void => {
    const fsEnsureDirSyncSpy = sandbox.stub(
      fs,
      'ensureDirSync',
    ).callsFake(sinon.fake.returns(facilitatorConfigPath));

    const fsWriteFileSyncSpy = sandbox.stub(
      fs,
      'writeFileSync',
    ).callsFake(sinon.fake.returns(true));

    const fsConfig: FacilitatorConfig = FacilitatorConfig.fromChain('');

    const directorySpy = sandbox.stub(
      Directory,
      'getMosaicDirectoryPath',
    ).callsFake(sinon.fake.returns(mosaicDirectoryPath));

    const pathSpy = sandbox.stub(
      path,
      'join',
    ).callsFake(sinon.fake.returns(facilitatorConfigPath));

    fsConfig.writeToFacilitatorConfig(chain);

    const data = {
      originChain: '',
      auxChainId: '',
      database: {},
      chains: {},
      encryptedAccounts: {},
    };
    const objectWritten = JSON.stringify(data, null, '    ');

    SpyAssert.assert(directorySpy, 1, [[]]);
    SpyAssert.assert(fsEnsureDirSyncSpy, 1, [[facilitatorConfigPath]]);

    SpyAssert.assert(fsWriteFileSyncSpy, 1, [[facilitatorConfigPath, objectWritten]]);
    SpyAssert.assert(
      pathSpy,
      2,
      [[mosaicDirectoryPath, chain], [facilitatorConfigPath, 'facilitator-config.json']],
    );
  });
});
