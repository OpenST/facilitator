import fs from 'fs-extra';
import path from 'path';
import sinon from 'sinon';

import { FacilitatorConfig } from '../../src/Config/Config';
import Directory from '../../src/Directory';
import SpyAssert from '../test_utils/SpyAssert';

const chain = 301;
const mosaicDirectoryPath = '.mosaic';
const facilitatorConfigPath = path.join(
  mosaicDirectoryPath,
  chain.toString(),
  Directory.MOSAIC_FACILITATOR_CONFIG,
);

describe('FacilitatorConfig.writeToFacilitatorConfig()', (): void => {
  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('should pass with valid arguments', (): void => {
    sinon.stub(
      Directory,
      'getMosaicDirectoryPath',
    ).returns(mosaicDirectoryPath);

    sinon.stub(
      fs,
      'ensureDirSync',
    );

    const writeFileSyncStub = sinon.stub(
      fs,
      'writeFileSync',
    );

    const existsSyncStub = sinon.stub(
      fs,
      'existsSync',
    ).returns(false);
    const fsConfig = FacilitatorConfig.fromChain(chain);
    existsSyncStub.restore();

    fsConfig.originChain = 'originChain';
    fsConfig.auxChainId = 2;
    fsConfig.chains = {};
    fsConfig.encryptedAccounts = {};

    const fsConfigJson = JSON.stringify(fsConfig, null, '    ');

    fsConfig.writeToFacilitatorConfig(chain);

    SpyAssert.assert(writeFileSyncStub, 1, [[facilitatorConfigPath, fsConfigJson]]);
  });
});
