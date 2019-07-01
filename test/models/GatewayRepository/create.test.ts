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

describe('GatewayRepository::create', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Checks creation of gateway model.', async (): Promise<void> => {
    const gatewayAttributes: GatewayAttributes = StubData.gatewayAttributes();

    const createResponse = await config.db.gatewayRepository.create(
      gatewayAttributes,
    );

    Util.checkGatewayAgainstAttributes(createResponse, gatewayAttributes);

    const gateway = await config.db.gatewayRepository.get(
      gatewayAttributes.gatewayAddress,
    );

    assert.notStrictEqual(
      gateway,
      null,
      'Newly created gateway does not exist.',
    );

    Util.checkGatewayAgainstAttributes(
      gateway as Gateway,
      gatewayAttributes,
    );
  });

  it('Throws if a gateway '
    + 'with the same gateway address already exists.', async (): Promise<void> => {
    const gatewayAttributesA: GatewayAttributes = StubData.gatewayAttributes();

    // All members, except gatewayAddress are different from gatewayAttributesA.
    const gatewayAttributesB: GatewayAttributes = StubData.gatewayAttributes();

    await config.db.gatewayRepository.create(
      gatewayAttributesA,
    );

    return assert.isRejected(
      config.db.gatewayRepository.create(
        gatewayAttributesB,
      ),
      /^Failed to create a gateway*/,
      'Creation should fail as a gateway with the same gateway address already exists.',
    );
  });
});
