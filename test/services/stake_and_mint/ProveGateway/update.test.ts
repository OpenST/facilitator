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
import Web3 from 'web3';

import ProveGatewayService from '../../../../src/services/stake_and_mint/ProveGatewayService';
import SpyAssert from '../../../test_utils/SpyAssert';
import StubData from '../../../test_utils/StubData';

describe('ProveGatewayService.update()', (): void => {
  const originWeb3 = new Web3(null);
  const auxiliaryWeb3 = new Web3(null);
  const auxiliaryWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const auxiliaryChainId = 123;
  let proveGatewayService: ProveGatewayService;

  beforeEach((): void => {
    proveGatewayService = new ProveGatewayService(
      sinon.fake() as any,
      sinon.fake() as any,
      originWeb3,
      auxiliaryWeb3,
      auxiliaryWorkerAddress,
      gatewayAddress,
      auxiliaryChainId,
    );
  });

  it('should react to update on auxiliary chain model ', async (): Promise<void> => {
    const originBlockHeight = new BigNumber(100);
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      auxiliaryChainId,
      originBlockHeight,
    );

    const reactToStub = sinon.stub(proveGatewayService, 'proveGateway');
    await proveGatewayService.update([auxiliaryChain]);

    SpyAssert.assert(reactToStub, 1, [[originBlockHeight]]);
  });

  it('should only react to interested chainID', async (): Promise<void> => {
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      1,
      new BigNumber(100),
    );

    const proveGatewayStub = sinon.stub(proveGatewayService, 'proveGateway');
    await proveGatewayService.update([auxiliaryChain]);

    SpyAssert.assert(proveGatewayStub, 0, [[]]);
  });


  it('should skip for null last origin block height', async (): Promise<void> => {
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      auxiliaryChainId,
      undefined,
    );

    const proveGatewayStub = sinon.stub(proveGatewayService, 'proveGateway');
    await proveGatewayService.update([auxiliaryChain]);

    SpyAssert.assert(proveGatewayStub, 0, [[]]);
  });
});
