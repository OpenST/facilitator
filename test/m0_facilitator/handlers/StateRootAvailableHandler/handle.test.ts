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
import sinon from 'sinon';

import StateRootAvailableHandler from '../../../../src/m0_facilitator/handlers/StateRootAvailableHandler';
import AuxiliaryChainRepository from '../../../../src/m0_facilitator/repositories/AuxiliaryChainRepository';
import SpyAssert from '../../../test_utils/SpyAssert';
import StubData from '../../../test_utils/StubData';

describe('StateRootAvailableHandler.handle()', (): void => {
  const auxiliaryChainId = 123;
  const coAnchorAddress = '0x0000000000000000000000000000000000000003';
  const someOtherAnchor = '0x0000000000000000000000000000000000000004';
  const blockHeight = new BigNumber(10);
  const transactions = [{
    contractAddress: someOtherAnchor,
    _blockHeight: blockHeight.toString(10),
  }];

  it('should save latest block height of interested anchor', async (): Promise<void> => {
    const save = sinon.stub();
    const transactionsWithInterestedAnchor = [{
      contractAddress: coAnchorAddress,
      _blockHeight: blockHeight.toString(10),
    }];

    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      coAnchorAddress,
      blockHeight.minus(1),
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        save: save as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new StateRootAvailableHandler(sinonMock as any, auxiliaryChainId);

    await handler.handle(transactionsWithInterestedAnchor);

    const expectedModel = StubData.getAuxiliaryChainRecord(
      coAnchorAddress,
      blockHeight,
    );
    SpyAssert.assert(save, 1, [[expectedModel]]);
  });

  it('should not save latest block height for non interested anchor', async (): Promise<void> => {
    const save = sinon.stub();
    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      coAnchorAddress,
      blockHeight.minus(1),
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        save: save as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new StateRootAvailableHandler(sinonMock as any, auxiliaryChainId);

    await handler.handle(transactions);

    SpyAssert.assert(save, 0, [[]]);
  });

  it('should not save latest block height for interested anchor with lower block height', async (): Promise<void> => {
    const save = sinon.stub();
    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      coAnchorAddress,
      blockHeight.plus(1),
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        save: save as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new StateRootAvailableHandler(sinonMock as any, auxiliaryChainId);

    await handler.handle(transactions);

    SpyAssert.assert(save, 0, [[]]);
  });

  it('should not save latest block height for interested anchor with equal block height', async (): Promise<void> => {
    const save = sinon.stub();
    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      coAnchorAddress,
      blockHeight,
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        save: save as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new StateRootAvailableHandler(sinonMock as any, auxiliaryChainId);

    await handler.handle(transactions);

    SpyAssert.assert(save, 0, [[]]);
  });
});
