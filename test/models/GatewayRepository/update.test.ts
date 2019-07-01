// /<reference path="util.ts"/>
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
import BigNumber from 'bignumber.js';

import {
  GatewayAttributes,
  Gateway,
} from '../../../src/models/GatewayRepository';

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

describe('GatewayRepository::update', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Checks updation of gateway.', async (): Promise<void> => {
    const createGatewayAttributes: GatewayAttributes = StubData.gatewayAttributes();

    const objectForUpdate = await config.db.gatewayRepository.create(
      createGatewayAttributes,
    );

    Util.checkGatewayAgainstAttributes(objectForUpdate, createGatewayAttributes);

    objectForUpdate.lastRemoteGatewayProvenBlockHeight = new BigNumber('12121212121212');

    await config.db.gatewayRepository.update(
      objectForUpdate,
    );

    const updatedGateway = await config.db.gatewayRepository.get(objectForUpdate.gatewayAddress);

    Util.checkGatewayAgainstAttributes(
      updatedGateway as Gateway,
      objectForUpdate,
    );
  });

  it('Updation should fail for a non existing gateway ', async (): Promise<void> => {
    const gatewayAttributes: GatewayAttributes = StubData.gatewayAttributes();

    const gatewayUpdateResponse = await config.db.gatewayRepository.update(
      gatewayAttributes,
    );

    assert.strictEqual(
      gatewayUpdateResponse[0],
      0,
      'Should return 0 as no rows were updated',
    );

    const updatedGateway = await config.db.gatewayRepository.get(gatewayAttributes.gatewayAddress);

    return assert.strictEqual(
      updatedGateway,
      null,
    );
  });
});
