import SpyAssert from "../SpyAssert";
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

    const spyDirectory = sinon.stub(Directory, 'getDBFilePath').callsFake(() => {
      return dbPath
    });

    const fsSpy = sinon.spy(fs, 'ensureDirSync');

    Database.create(chainId);
    SpyAssert.assert(spyDirectory, 1, [[chainId]]);
    SpyAssert.assert(fsSpy, 1, [[dbPath]]);

    fsSpy.restore();
    spyDirectory.restore();
    sinon.restore();
  });
});
