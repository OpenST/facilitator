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

import 'mocha';

import {
  StakeRequest,
  StakeRequestAttributes,
} from '../../../src/models/StakeRequestRepository';

import Database from '../../../src/models/Database';

import Util from './util';
import StubData from '../../utils/StubData';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const { assert } = chai;

interface TestConfigInterface {
  db: Database;
}
let config: TestConfigInterface;

describe('StakeRequestRepository::bulkCreate', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });


  it('should create stake request in bulk', async (): Promise<void> => {
    const stakeRequestAttributes: StakeRequestAttributes [] = [
      StubData.getAStakeRequest('stakeRequestHash1'),
      StubData.getAStakeRequest('stakeRequestHash2'),
      StubData.getAStakeRequest('stakeRequestHash3'),
    ];

    const stakeRequestResponse = await config.db.stakeRequestRepository.bulkCreate(
      stakeRequestAttributes,
    );

    assert.strictEqual(
      stakeRequestAttributes.length,
      stakeRequestResponse.length,
      'Number of stake request object must be equal to stake request attribute objects',
    );

    stakeRequestAttributes.forEach(
      (value, index) => Util.checkStakeRequestAgainstAttributes(
        stakeRequestResponse[index] as unknown as StakeRequest,
        value,
      ),
    );
    stakeRequestAttributes.forEach(async (value, index) => {
      const stakeRequest = await config.db.stakeRequestRepository.get(
        value.stakeRequestHash,
      );

      assert.notStrictEqual(
        stakeRequest,
        null,
        'Newly created stake request does not exist.',
      );

      Util.checkStakeRequestAgainstAttributes(
        stakeRequestResponse[index] as unknown as StakeRequest,
        value,
      );
    });
  });

  it('Should not fail to create remaining records if some of them already exists during bulk create', async (): Promise<void> => {
    let stakeRequestAttributes: StakeRequestAttributes [] = [
      StubData.getAStakeRequest('stakeRequestHash1'),
      StubData.getAStakeRequest('stakeRequestHash2'),
      StubData.getAStakeRequest('stakeRequestHash3'),
    ];

    await config.db.stakeRequestRepository.bulkCreate(
      stakeRequestAttributes,
    );

    stakeRequestAttributes = [
      ...stakeRequestAttributes,
      StubData.getAStakeRequest('stakeRequestHash4'),
    ];

    const stakeRequestResponse = await config.db.stakeRequestRepository.bulkCreate(
      stakeRequestAttributes,
    );

    assert.strictEqual(
      stakeRequestResponse.length,
      4,
      'Only one record should be returned from database',
    );
  });
});
