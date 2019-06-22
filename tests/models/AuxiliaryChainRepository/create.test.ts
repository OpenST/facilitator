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

describe('AuxiliaryChainRepository::create', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      db: await Database.create(),
    };
  });

  it('Checks creation of auxiliary chain model.', async (): Promise<void> => {
    const auxiliaryChainAttributes: AuxiliaryChainAttributes = {
      chainId: 10001,
      originChainName: '10001',
      ostGatewayAddress: '0x497A49648885f7aaC3d761817F191ee1AFAF399C',
      ostCoGatewayAddress: '0x497A49648885f7aaB3d761817F191ee1AFAF399C',
      anchorAddress: '0x3F45616cFb992988943ff3bA00e8c0aA46B4540a',
      coAnchorAddress: '0xD1008015aA0Cf2a61493Bd19dE6C9ca88E934FCe',
    };

    const createResponse = await config.db.auxiliaryChainRepository.create(
      auxiliaryChainAttributes,
    );

    Util.checkAuxiliaryChainAgainstAttributes(createResponse, auxiliaryChainAttributes);

    const auxiliaryChain = await config.db.auxiliaryChainRepository.get(
      auxiliaryChainAttributes.chainId,
    );

    assert.notStrictEqual(
      auxiliaryChain,
      null,
      'Newly created auxiliary chain does not exist.',
    );

    Util.checkAuxiliaryChainAgainstAttributes(
      auxiliaryChain as AuxiliaryChain,
      auxiliaryChainAttributes,
    );
  });

  it('Throws if an auxiliary chain '
    + 'with the same chain id already exists.', async (): Promise<void> => {
    const auxiliaryChainAttributesA: AuxiliaryChainAttributes = {
      chainId: 10002,
      originChainName: '10002',
      ostGatewayAddress: '0x497A49648885f7aaC3d761817F191ee1AFAF399C',
      ostCoGatewayAddress: '0x497A49648885f7aaC3d761817E191ee1AFAF399C',
      anchorAddress: '0x3F45616cFb992988943ff3bA00e8c0aA46B4540a',
      coAnchorAddress: '0xD1008015aA0Cf2a61493Bd19dE6C9ca88E934FCe',
    };

    // All members, except chainId from auxiliaryChainAttributesA.
    const auxiliaryChainAttributesB: AuxiliaryChainAttributes = {
      chainId: 10002,
      originChainName: '10003',
      ostGatewayAddress: '0x197A49648885f7aaC3d761817F191ee1AFAF399C',
      ostCoGatewayAddress: '0x497A49648885f7aaC3d761817E191ee1AFBF399C',
      anchorAddress: '0x3F43616cFb992988943ff3bA00e8c0aA46B4540a',
      coAnchorAddress: '0xD1108015aA0Cf2a61493Bd19dE6C9ca88E934FCe',
    };

    await config.db.auxiliaryChainRepository.create(
      auxiliaryChainAttributesA,
    );

    return assert.isRejected(
      config.db.auxiliaryChainRepository.create(
        auxiliaryChainAttributesB,
      ),
      /^Failed to create an auxiliary chain*/,
      'Creation should fail as a auxiliary chain with the same chain id already exists.',
    );
  });
});
