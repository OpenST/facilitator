// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------


import fs from 'fs-extra';
import sinon from 'sinon';

import DBFileHelper from '../../../src/m0-facilitator/DatabaseFileHelper';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

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
    sinon.restore();
  });

  it('should pass with valid arguments', (): void => {
    const fsSpy = sinon.stub(
      fs,
      'existsSync',
    ).returns(true);

    assertion(1, dbFilePath, true, 'DB file path is valid.', fsSpy);
  });

  it('should fail when db file path doesn\'t exist', (): void => {
    const fsSpy = sinon.stub(
      fs,
      'existsSync',
    ).returns(false);

    assertion(1, dbFilePath, false, 'Db file path exists.', fsSpy);
  });
});
