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
  AuxiliaryChainAttributes,
  AuxiliaryChain,
} from '../../../src/models/AuxiliaryChainRepository';

import Database from '../../../src/models/Database';

import Util from './util';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { assert } = chai;

interface TestConfigInterface {
  db: Database;
}
let config: TestConfigInterface;

describe('AuxiliaryChainRepository::update', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Checks update of an auxiliary chain model.', async (): Promise<void> => {
    const createAuxiliaryChainAttributes: AuxiliaryChainAttributes = {
      chainId: 10001,
      originChainName: '10001',
      ostGatewayAddress: '0x0000000000000000000000000000000000000001',
      ostCoGatewayAddress: '0x0000000000000000000000000000000000000002',
      anchorAddress: '0x0000000000000000000000000000000000000003',
      coAnchorAddress: '0x0000000000000000000000000000000000000004',
    };

    const objectForUpdate = await config.db.auxiliaryChainRepository.create(
      createAuxiliaryChainAttributes,
    );

    Util.checkAuxiliaryChainAgainstAttributes(objectForUpdate, createAuxiliaryChainAttributes);

    objectForUpdate.lastProcessedBlockNumber = new BigNumber('214748364474');
    objectForUpdate.lastAuxiliaryBlockHeight = new BigNumber('214748364475');
    objectForUpdate.lastAuxiliaryBlockHeight = new BigNumber('214748364476');

    const updated = await config.db.auxiliaryChainRepository.update(
      objectForUpdate,
    );

    assert.isOk(
      updated,
      'Entry should be updated, as chain id in chain attributes exists.',
    );

    const updatedAuxiliaryChain = await config.db.auxiliaryChainRepository.get(
      objectForUpdate.chainId,
    );

    Util.checkAuxiliaryChainAgainstAttributes(
      updatedAuxiliaryChain as AuxiliaryChain,
      objectForUpdate,
    );
  });

  it('Update should fail for a non existing auxiliary chain ', async (): Promise<void> => {
    const auxiliaryChainAttributes: AuxiliaryChainAttributes = {
      chainId: 10002,
      originChainName: '10003',
      ostGatewayAddress: '0x0000000000000000000000000000000000000001',
      ostCoGatewayAddress: '0x0000000000000000000000000000000000000002',
      anchorAddress: '0x0000000000000000000000000000000000000003',
      coAnchorAddress: '0x0000000000000000000000000000000000000004',
    };

    const updated = await config.db.auxiliaryChainRepository.update(
      auxiliaryChainAttributes,
    );

    assert.isNotOk(
      updated,
      'The chain id in the passed chain attributes does not exist, hence no update.',
    );

    const updatedAuxiliaryChain = await config.db.auxiliaryChainRepository.get(
      auxiliaryChainAttributes.chainId,
    );

    return assert.strictEqual(
      updatedAuxiliaryChain,
      null,
    );
  });
});
