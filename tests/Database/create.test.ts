import SpyAssert from "../SpyAssert";
import * as sqlite from 'sqlite3';
import * as fs from 'fs-extra';
import Directory from "../../src/Directory";
import Database from "../../src/Database";
import {assert} from 'chai';

const sinon = require('sinon');

describe('Database.create()', function () {
  const chainId = '1';

  it('should fail when chain id is null', function () {
    assert.throws(() => Database.create(null), 'invalid chain id');
  });

  it('should fail when chain id is blank', function () {
    assert.throws(() => Database.create(''), 'invalid chain id');
  });

  it('should pass with valid arguments', function () {
    const dbPath = 'tests/Database/';
    const dbFileName = 'OSTFacilitator.db';

    const spyDirectory = sinon.replace(
      Directory,
      'getDBFilePath',
      sinon.fake.returns(dbPath),
    );

    const fsSpy = sinon.replace(
      fs,
      'ensureDirSync',
      sinon.fake.returns(''),
    );

    const sqliteSpy = sinon.replace(
      sqlite,
      'Database',
      sinon.fake.returns('sqlite db is created')
    );

    Database.create(chainId);

    SpyAssert.assert(sqliteSpy, 1, [[`${dbPath + dbFileName}`]]);
    SpyAssert.assert(spyDirectory, 1, [[chainId]]);
    SpyAssert.assert(fsSpy, 1, [[dbPath]]);

    sinon.restore();
  });
});
