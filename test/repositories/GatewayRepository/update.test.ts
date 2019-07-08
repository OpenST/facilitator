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
} from '../../../src/repositories/GatewayRepository';

import Repositories from '../../../src/repositories/Repositories';

import Util from './util';

import assert from '../../test_utils/assert';
import StubData from '../../test_utils/StubData';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('GatewayRepository::update', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks update of gateway.', async (): Promise<void> => {
    const createGatewayAttributes: GatewayAttributes = StubData.gatewayAttributes();

    const objectForUpdate = await config.repos.gatewayRepository.create(
      createGatewayAttributes,
    );

    Util.checkGatewayAgainstAttributes(objectForUpdate, createGatewayAttributes);

    const updated = await config.repos.gatewayRepository.update(
      objectForUpdate,
    );

    assert.isOk(
      updated,
      'An entry should be updated, as the gateway address in the attributes exists.',
    );

    const updatedGateway = await config.repos.gatewayRepository.get(
      objectForUpdate.gatewayAddress,
    );

    Util.checkGatewayAgainstAttributes(
      updatedGateway as Gateway,
      objectForUpdate,
    );
  });

  it('Updation should fail for a non existing gateway ', async (): Promise<void> => {
    const gatewayAttributes: GatewayAttributes = StubData.gatewayAttributes();

    const updated = await config.repos.gatewayRepository.update(
      gatewayAttributes,
    );

    assert.isNotOk(
      updated,
      'The gateway address in the passed attributes does not exist, hence no update.',
    );

    const updatedGateway = await config.repos.gatewayRepository.get(
      gatewayAttributes.gatewayAddress,
    );

    return assert.strictEqual(
      updatedGateway,
      null,
    );
  });
});
