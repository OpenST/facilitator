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
import StubData from '../../test_utils/StubData';

import assert from '../../test_utils/assert';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('GatewayRepository::get', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks retrieval of an existing gateway.', async (): Promise<void> => {
    const gatewayAttributes: GatewayAttributes = StubData.gatewayAttributes();

    await config.repos.gatewayRepository.create(
      gatewayAttributes,
    );

    const gateway = await config.repos.gatewayRepository.get(
      gatewayAttributes.gatewayAddress,
    );

    assert.notStrictEqual(
      gateway,
      null,
      'Gateway should exist as it has been just created.',
    );

    Util.checkGatewayAgainstAttributes(
      gateway as Gateway,
      gatewayAttributes,
    );
  });

  it('Checks retrieval of non-existing gateway.', async (): Promise<void> => {
    const nonExistingGatewayAddress = 'nonExistingGatewayAddress';
    const gateway = await config.repos.gatewayRepository.get(
      nonExistingGatewayAddress,
    );

    assert.strictEqual(
      gateway,
      null,
      'Gateway  with \'nonExistingGatewayAddress\' does not exist.',
    );
  });
});
