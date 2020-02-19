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
import sinon, { SinonStub } from 'sinon';

import { FacilitatorConfig } from '../../src/Config/Config';
import Directory from '../../src/Directory';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

let facilitatorConfigPathSpy: SinonStub<[string, number, string], string>;
let fsSpy: any;

async function spyFsModule(status: boolean): Promise<any> {
  fsSpy = sinon.stub(
    fs,
    'existsSync',
  ).callsFake(sinon.fake.returns(status));
}

describe('FacilitatorConfig.isFacilitatorConfigPresent()', (): void => {
  const auxChainId = 1000;
  const originChain = 'dev';
  const dummyGatewayAddress = '0x34817AF7B685DBD8a360e8Bed3121eb03D56C9BD';
  const facilitatorConfigPath = 'test/Database/facilitator-config.json';

  beforeEach(async (): Promise<void> => {
    facilitatorConfigPathSpy = sinon.stub(
      Directory,
      'getFacilitatorConfigPath',
    ).returns(facilitatorConfigPath);
  });

  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('should pass with valid arguments', (): void => {
    spyFsModule(true);

    const status: boolean = FacilitatorConfig.isFacilitatorConfigPresent(
      originChain,
      auxChainId,
      dummyGatewayAddress,
    );
    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(facilitatorConfigPathSpy, 1, [[originChain, auxChainId, dummyGatewayAddress]]);
    assert.strictEqual(
      status,
      true,
      `Facilitator config for ${auxChainId} should be present`,
    );
  });

  it('should fail when file is empty', (): void => {
    spyFsModule(false);

    const status: boolean = FacilitatorConfig.isFacilitatorConfigPresent(
      originChain,
      auxChainId,
      dummyGatewayAddress,
    );

    SpyAssert.assert(fsSpy, 1, [[facilitatorConfigPath]]);
    SpyAssert.assert(facilitatorConfigPathSpy, 1, [[originChain, auxChainId, dummyGatewayAddress]]);

    assert.strictEqual(
      status,
      false,
      `Facilitator config for chain ${auxChainId} should not be present`,
    );
  });
});
