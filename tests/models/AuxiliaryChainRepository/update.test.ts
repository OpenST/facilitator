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

  it('Checks updation of auxiliary chain model.', async (): Promise<void> => {
    const createAuxiliaryChainAttributes: AuxiliaryChainAttributes = {
      chainId: 10001,
      originChainName: '10001',
      ostGatewayAddress: '0x497A49648885f7aaC3d761817F191ee1AFAF399C',
      ostCoGatewayAddress: '0x497A49648885f7aaB3d761817F191ee1AFAF399C',
      anchorAddress: '0x3F45616cFb992988943ff3bA00e8c0aA46B4540a',
      coAnchorAddress: '0xD1008015aA0Cf2a61493Bd19dE6C9ca88E934FCe',
    };

    const objectForUpdate = await config.db.auxiliaryChainRepository.create(
      createAuxiliaryChainAttributes,
    );

    Util.checkAuxiliaryChainAgainstAttributes(objectForUpdate, createAuxiliaryChainAttributes);

    objectForUpdate.lastProcessedBlockNumber = 1;
    objectForUpdate.lastAuxiliaryBlockHeight = 2;
    objectForUpdate.lastOriginBlockHeight = 3;

    const updateResponse = await config.db.auxiliaryChainRepository.update(
      objectForUpdate,
    );

    assert.strictEqual(
      updateResponse[0],
      0,
      'Should return [0] as no records were updated in DB',
    );

    const updatedAuxiliaryChain = await config.db.auxiliaryChainRepository.get(objectForUpdate.chainId);

    Util.checkAuxiliaryChainAgainstAttributes(
      updatedAuxiliaryChain as AuxiliaryChain,
      objectForUpdate,
    );
  });

  it('Updation should fail for a non existing auxiliary chain ', async (): Promise<void> => {
    const auxiliaryChainAttributes: AuxiliaryChainAttributes = {
      chainId: 10002,
      originChainName: '10003',
      ostGatewayAddress: '0x197A49648885f7aaC3d761817F191ee1AFAF399C',
      ostCoGatewayAddress: '0x497A49648885f7aaC3d761817E191ee1AFBF399C',
      anchorAddress: '0x3F43616cFb992988943ff3bA00e8c0aA46B4540a',
      coAnchorAddress: '0xD1108015aA0Cf2a61493Bd19dE6C9ca88E934FCe',
    };

    await config.db.auxiliaryChainRepository.update(
      auxiliaryChainAttributes,
    );

    const updatedAuxiliaryChain = await config.db.auxiliaryChainRepository.get(auxiliaryChainAttributes.chainId);

    return assert.strictEqual(
      updatedAuxiliaryChain,
      null,
    );
  });
});
