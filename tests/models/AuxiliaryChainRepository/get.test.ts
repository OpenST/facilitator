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
  AuxiliaryChainAttributes,
  AuxiliaryChain,
} from '../../../src/models/AuxiliaryChainRepository';
import Database from '../../../src/models/Database';

import Util from './util';

import assert = require('assert');

interface TestConfigInterface {
  db: Database;
}
let config: TestConfigInterface;

describe('AuxiliaryChainRepository::get', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Checks retrieval of an existing auxiliary chain.', async (): Promise<void> => {
    const auxiliaryChainAttributes: AuxiliaryChainAttributes = {
      chainId: 10001,
      originChainName: '10001',
      ostGatewayAddress: '0x0000000000000000000000000000000000000001',
      ostCoGatewayAddress: '0x0000000000000000000000000000000000000002',
      anchorAddress: '0x0000000000000000000000000000000000000003',
      coAnchorAddress: '0x0000000000000000000000000000000000000004',
    };

    await config.db.auxiliaryChainRepository.create(
      auxiliaryChainAttributes,
    );

    const auxiliaryChain = await config.db.auxiliaryChainRepository.get(
      auxiliaryChainAttributes.chainId,
    );

    assert.notStrictEqual(
      auxiliaryChain,
      null,
      'Auxiliary chain should exist as it has been just created.',
    );

    Util.checkAuxiliaryChainAgainstAttributes(
      auxiliaryChain as AuxiliaryChain,
      auxiliaryChainAttributes,
    );
  });

  it('Checks retrieval of non-existing chain.', async (): Promise<void> => {
    const nonExistingChainId = 1;
    const auxiliaryChain = await config.db.auxiliaryChainRepository.get(
      nonExistingChainId,
    );

    assert.strictEqual(
      auxiliaryChain,
      null,
      'Auxiliary chain  with \'nonExistingChainId\' does not exist.',
    );
  });
});
