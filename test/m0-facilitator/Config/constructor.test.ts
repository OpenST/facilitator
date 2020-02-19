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


import sinon from 'sinon';

import { Config } from '../../../src/m0-facilitator/Config/Config';
import assert from '../test_utils/assert';
import GatewayAddresses from '../../../src/m0-facilitator/Config/GatewayAddresses';

describe('Config.constructor()', () => {
  it('should pass with valid arguments', () => {
    const gatewayAddresses = sinon.createStubInstance(GatewayAddresses);
    const facilitator = sinon.fake() as any;
    const config = new Config(gatewayAddresses, facilitator);

    assert.strictEqual(
      config.facilitator,
      facilitator,
      'Facilitator object is different',
    );
    assert.strictEqual(
      config.gatewayAddresses,
      gatewayAddresses,
      'Gateway addresses object is different',
    );

    sinon.restore();
  });
});
