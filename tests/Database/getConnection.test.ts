import SpyAssert from "../SpyAssert";
import * as sqlite from 'sqlite3';
import Database from "../../src/Database";
import {assert} from 'chai';

const sinon = require('sinon');

describe('Database.getConnection()', function () {
  const dbFilePath = 'tests/Database/';

  function spyVerifyMethod(status: boolean) {
    const spyVerify = sinon.replace(
      Database,
      'verify',
      sinon.fake.returns(status),
    );

    return spyVerify;
  }

  it('should fail when db file path do not exists', function () {
    const spyVerify = spyVerifyMethod(false);

    assert.throws(() => Database.getConnection(dbFilePath), 'database file path is invalid');
    SpyAssert.assert(spyVerify, 1, [[dbFilePath]]);
    sinon.restore();
  });

  it('should pass with valid arguments', function () {
    const spyVerify = spyVerifyMethod(true);

    const sqliteSpy = sinon.replace(
      sqlite,
      'Database',
      sinon.fake.returns('sqlite db is created')
    );

    Database.getConnection(dbFilePath);

    SpyAssert.assert(sqliteSpy, 1, [[dbFilePath]]);
    SpyAssert.assert(spyVerify, 1, [[dbFilePath]]);
    sinon.restore();
  });
});
