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


import BigNumber from 'bignumber.js';

import AuxiliaryChain from '../../../../src/m0_facilitator/models/AuxiliaryChain';
import Repositories from '../../../../src/m0_facilitator/repositories/Repositories';
import assert from '../../../test_utils/assert';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

describe('AuxiliaryChain::get', (): void => {
  let auxiliaryChain: AuxiliaryChain;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    const chainId = 2;
    const originChainName = 'ropsten';
    const eip20GatewayAddress = '0x0000000000000000000000000000000000000001';
    const eip20CoGatewayAddress = '0x0000000000000000000000000000000000000002';
    const anchorAddress = '0x0000000000000000000000000000000000000003';
    const coAnchorAddress = '0x0000000000000000000000000000000000000004';
    const lastOriginBlockHeight = new BigNumber('200');
    const lastAuxiliaryBlockHeight = new BigNumber('50');
    const createdAt = new Date();
    const updatedAt = new Date();

    auxiliaryChain = new AuxiliaryChain(
      chainId,
      originChainName,
      eip20GatewayAddress,
      eip20CoGatewayAddress,
      anchorAddress,
      coAnchorAddress,
      lastOriginBlockHeight,
      lastAuxiliaryBlockHeight,
      createdAt,
      updatedAt,
    );
    await config.repos.auxiliaryChainRepository.save(
      auxiliaryChain,
    );
  });

  it('should pass when retrieving AuxiliaryChain model', async (): Promise<void> => {
    const getResponse = await config.repos.auxiliaryChainRepository.get(
      auxiliaryChain.chainId,
    );

    Util.assertAuxiliaryChainAttributes(getResponse as AuxiliaryChain, auxiliaryChain);
  });

  it('should return null when querying for non-existing '
    + 'chainId', async (): Promise<void> => {
    const nonExistingChainId = 22;

    const getResponse = await config.repos.auxiliaryChainRepository.get(
      nonExistingChainId,
    );

    assert.strictEqual(
      getResponse,
      null,
      'Non existing AuxiliaryChain object.',
    );
  });
});
