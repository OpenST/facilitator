import fs from 'fs-extra';
import sinon from 'sinon';

import DBFileHelper from '../../src/DatabaseFileHelper';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

const sandbox = sinon.createSandbox();

function assertion(
  callCount: number,
  dbFilePath: string,
  expectedStatus: boolean,
  message: string,
  fsSpy: any,
): void {
  const verificationStatus: boolean = DBFileHelper.verify(dbFilePath);

  SpyAssert.assert(fsSpy, callCount, [[dbFilePath]]);

  assert.strictEqual(
    verificationStatus,
    expectedStatus,
    message,
  );
}

const dbFilePath = 'tests/Database/OSTFacilitator.db';

describe('Database.verify()', (): void => {
  afterEach(async (): Promise<void> => {
    sandbox.restore();
  });

  it('should pass with valid arguments', (): void => {
    const fsSpy = sandbox.stub(
      fs,
      'existsSync',
    ).returns(true);

    assertion(1, dbFilePath, true, 'DB file path is valid.', fsSpy);
  });

  it('should fail when db file path doesn\'t exist', (): void => {
    const fsSpy = sandbox.stub(
      fs,
      'existsSync',
    ).returns(false);

    assertion(1, dbFilePath, false, 'Db file path exists.', fsSpy);
  });
});
