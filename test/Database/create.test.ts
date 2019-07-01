import * as sqlite from 'sqlite3';
import * as fs from 'fs-extra';
import SpyAssert from '../utils/SpyAssert';
import Directory from '../../src/Directory';
import DBFileHelper from '../../src/DatabaseFileHelper';
import assert from '../utils/assert';

const sinon = require('sinon');

describe('Database.create()', () => {
  const chainId = '1';

  it('should fail when chain id is blank', () => {
    assert.throws(() => DBFileHelper.create(''), 'invalid chain id');
  });

  it('should pass with valid arguments', () => {
    const dbPath = 'test/Database/';
    const dbFileName = 'mosaic_facilitator.db';

    const spyDirectory = sinon.stub(Directory, 'getDBFilePath').callsFake(() => dbPath);

    const sqliteSpy = sinon.replace(
      sqlite,
      'Database',
      sinon.fake.returns('sqlite db is created'),
    );

    const fsSpy = sinon.stub(fs, 'ensureDirSync').callsFake(() => true);

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

    fsSpy.restore();
    spyDirectory.restore();
    sinon.restore();
  });
});
