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

import AuxiliaryChain from '../../../src/models/AuxiliaryChain';
import Repositories from '../../../src/repositories/Repositories';
import Util from './util';
import assert, { assertErrorMessages } from '../../test_utils/assert';

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

describe('AuxiliaryChainRepository::save', (): void => {
  let chainId: number;
  let originChainName: string;
  let eip20GatewayAddress: string;
  let eip20CoGatewayAddress: string;
  let anchorAddress: string;
  let coAnchorAddress: string;
  let lastOriginBlockHeight: BigNumber;
  let lastAuxiliaryBlockHeight: BigNumber;
  let createdAt: Date;
  let updatedAt: Date;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    chainId = 2;
    originChainName = 'ropsten';
    eip20GatewayAddress = '0x0000000000000000000000000000000000000001';
    eip20CoGatewayAddress = '0x0000000000000000000000000000000000000002';
    anchorAddress = '0x0000000000000000000000000000000000000003';
    coAnchorAddress = '0x0000000000000000000000000000000000000004';
    lastOriginBlockHeight = new BigNumber('200');
    lastAuxiliaryBlockHeight = new BigNumber('50');
    createdAt = new Date();
    updatedAt = new Date();
  });

  it('should pass when creating AuxiliaryChain model.', async (): Promise<void> => {
    const auxiliaryChain = new AuxiliaryChain(
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
    const createdAuxiliaryChain = await config.repos.auxiliaryChainRepository.save(
      auxiliaryChain,
    );

    Util.assertAuxiliaryChainAttributes(createdAuxiliaryChain, auxiliaryChain);
  });

  it('should pass when updating AuxiliaryChain model', async (): Promise<void> => {
    const auxiliaryChain = new AuxiliaryChain(
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

    auxiliaryChain.originChainName = 'goerli';
    const updatedAuxiliaryChain = await config.repos.auxiliaryChainRepository.save(
      auxiliaryChain,
    );

    Util.assertAuxiliaryChainAttributes(updatedAuxiliaryChain, auxiliaryChain);
  });

  it('should fail when eip20GatewayAddress is null', async (): Promise<void> => {
    const auxiliaryChain = new AuxiliaryChain(
      chainId,
      originChainName,
      null as any,
      eip20CoGatewayAddress,
      anchorAddress,
      coAnchorAddress,
      lastOriginBlockHeight,
      lastAuxiliaryBlockHeight,
      createdAt,
      updatedAt,
    );

    assert.isRejected(config.repos.auxiliaryChainRepository.save(
      auxiliaryChain,
    ),
    'AuxiliaryChain.eip20GatewayAddress cannot be null');
  });

  it('should fail when eip20GatewayAddress is undefined', async (): Promise<void> => {
    const auxiliaryChain = new AuxiliaryChain(
      chainId,
      originChainName,
      undefined as any,
      eip20CoGatewayAddress,
      anchorAddress,
      coAnchorAddress,
      lastOriginBlockHeight,
      lastAuxiliaryBlockHeight,
      createdAt,
      updatedAt,
    );

    assert.isRejected(
      config.repos.auxiliaryChainRepository.save(
        auxiliaryChain,
      ),
      'AuxiliaryChain.eip20GatewayAddress cannot be null',
    );
  });


  it('should fail when multiple parameters are undefined', async (): Promise<void> => {
    // It is used to test for multiple validations failure.

    const auxiliaryChain = new AuxiliaryChain(
      chainId,
      undefined as any,
      '0xacd142',
      '0x123',
      '0x24A3f',
      '0xd32fe3',
      lastOriginBlockHeight,
      lastAuxiliaryBlockHeight,
      createdAt,
      updatedAt,
    );

    assert.isRejected(
      config.repos.auxiliaryChainRepository.save(
        auxiliaryChain,
      ),
    );

    try {
      await config.repos.auxiliaryChainRepository.save(auxiliaryChain);
    } catch (error) {
      assertErrorMessages(error.errors, [
        'AuxiliaryChain.originChainName cannot be null',
        'Validation len on eip20GatewayAddress failed',
        'Validation len on eip20CoGatewayAddress failed',
        'Validation len on anchorAddress failed',
        'Validation len on coAnchorAddress failed',
      ]);
    }
  });
});
