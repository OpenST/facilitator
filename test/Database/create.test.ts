import fs from 'fs-extra';
import sinon from 'sinon';
import sqlite from 'sqlite3';

import DBFileHelper from '../../src/DatabaseFileHelper';
import Directory from '../../src/Directory';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

const chainId = '1';

describe('Database.create()', (): void => {
  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('should fail when chain id is blank', (): void => {
    assert.throws((): string => DBFileHelper.create(''), 'invalid chain id');
  });

  it('should pass with valid arguments', (): void => {
    const dbPath = 'test/Database/';
    const dbFileName = 'mosaic_facilitator.db';

    const spyDirectory = sinon.stub(
      Directory, 'getDBFilePath',
    ).returns(dbPath);

    const sqliteSpy = sinon.stub(
      sqlite,
      'Database',
    ).returns(
      'sqlite db is created',
    );

    const fsSpy = sinon.stub(fs, 'ensureDirSync').callsFake((): boolean => true);

    const actualFacilitatorConfigPath = DBFileHelper.create(chainId);
    const expectedFacilitatorConfigPath = `${dbPath + dbFileName}`;

    SpyAssert.assert(spyDirectory, 1, [[chainId]]);

    SpyAssert.assert(fsSpy, 1, [[dbPath]]);

    SpyAssert.assert(sqliteSpy, 1, [[expectedFacilitatorConfigPath]]);

    assert.strictEqual(
      actualFacilitatorConfigPath,
      expectedFacilitatorConfigPath,
      'Facilitator config path is incorrect',
    );
  });
});
