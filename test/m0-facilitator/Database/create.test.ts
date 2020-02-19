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
import sqlite from 'sqlite3';

import DBFileHelper from '../../../src/m0-facilitator/DatabaseFileHelper';
import Directory from '../../../src/m0-facilitator/Directory';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

const auxChainId = 1;

describe('Database.create()', (): void => {
  const originChainId = 'dev';
  const dummyGatewayAddress = '0x34817AF7B685DBD8a360e8Bed3121eb03D56C9BD';
  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('should fail when aux chain id is 0', (): void => {
    const auxChainId = 0;
    assert.throws(
      (): string => DBFileHelper.create(originChainId, auxChainId, dummyGatewayAddress),
      `invalid auxiliary chain id ${auxChainId}`,
    );
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

    const actualFacilitatorConfigPath = DBFileHelper.create(originChainId, auxChainId, dummyGatewayAddress);
    const expectedFacilitatorConfigPath = `${dbPath + dbFileName}`;

    SpyAssert.assert(spyDirectory, 1, [[originChainId, auxChainId, dummyGatewayAddress]]);

    SpyAssert.assert(fsSpy, 1, [[dbPath]]);

    SpyAssert.assert(sqliteSpy, 1, [[expectedFacilitatorConfigPath]]);

    assert.strictEqual(
      actualFacilitatorConfigPath,
      expectedFacilitatorConfigPath,
      'Facilitator config path is incorrect',
    );
  });
});
