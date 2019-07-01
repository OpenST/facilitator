import * as fs from 'fs-extra';
import SpyAssert from "./../utils/SpyAssert";
import DBFileHelper from "../../src/DatabaseFileHelper";
import {assert} from 'chai';

const sinon = require('sinon');

describe('DatabaseFileHelper.verify()', function () {

  function spyFsModule(status: boolean) {
    const fsSpy = sinon.replace(
      fs,
      'existsSync',
      sinon.fake.returns(status),
    );
    return fsSpy;
  }

  function assertion(
    callCount: number,
    dbFilePath: string,
    expectedStatus: boolean,
    message: string,
    fsSpy: any
  ) {
    const verificationStatus: boolean = DBFileHelper.verify(dbFilePath);

    SpyAssert.assert(fsSpy, callCount, [[dbFilePath]]);
    assert.strictEqual(
      verificationStatus,
      expectedStatus,
      message
    );
  }

  const dbFilePath = 'tests/Database/OSTFacilitator.db';

  it('should pass with valid arguments', function () {
    const fsSpy = spyFsModule(true);

    assertion(1, dbFilePath, true, 'DB file is invalid', fsSpy);
    sinon.restore();
  });

  it('should fail when file extension is invalid', function () {
    let dbFilePath = 'tests/Database/OSTFacilitator.txt';
    const fsSpy = spyFsModule(true);

    assertion(1, dbFilePath, false, 'Db file extension is valid', fsSpy);
    sinon.restore();
  });

  it('should fail when db file path doesn\'t exists', function () {
    const fsSpy = spyFsModule(false);

    assertion(1, dbFilePath, false, 'Db file path exists', fsSpy);
    sinon.restore();
  });
});