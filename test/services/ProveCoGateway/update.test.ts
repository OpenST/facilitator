import BigNumber from 'bignumber.js';
import sinon from 'sinon';
import Web3 from 'web3';

import ProveCoGatewayService from '../../../src/services/redeem_and_unstake/ProveCoGatewayService';
import SpyAssert from '../../test_utils/SpyAssert';
import StubData from '../../test_utils/StubData';

describe('ProveCoGatewayService.update()', (): void => {
  const originWeb3 = new Web3(null);
  const auxiliaryWeb3 = new Web3(null);
  const originWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const coGatewayAddress = '0x0000000000000000000000000000000000000001';
  const auxiliaryChainId = 123;
  let proveCoGatewayService: ProveCoGatewayService;

  beforeEach((): void => {
    proveCoGatewayService = new ProveCoGatewayService(
      sinon.fake() as any,
      sinon.fake() as any,
      originWeb3,
      auxiliaryWeb3,
      originWorkerAddress,
      coGatewayAddress,
      auxiliaryChainId,
    );
  });

  it('should react to update on auxiliary chain model ', async (): Promise<void> => {
    const originBlockHeight = new BigNumber(100);
    const auxiliaryBlockHeight = new BigNumber(200);
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      auxiliaryChainId,
      originBlockHeight,
      auxiliaryBlockHeight,
    );

    const reactToStub = sinon.stub(proveCoGatewayService, 'proveCoGateway');
    await proveCoGatewayService.update([auxiliaryChain]);

    SpyAssert.assert(reactToStub, 1, [[auxiliaryBlockHeight]]);
  });

  it('should only react to interested chainID', async (): Promise<void> => {
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      1,
      new BigNumber(100),
      new BigNumber(200),
    );

    const proveGatewayStub = sinon.stub(proveCoGatewayService, 'proveCoGateway');
    await proveCoGatewayService.update([auxiliaryChain]);

    SpyAssert.assert(proveGatewayStub, 0, [[]]);
  });


  it('should skip for null last origin block height', async (): Promise<void> => {
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      auxiliaryChainId,
      new BigNumber(100),
      undefined,
    );

    const proveGatewayStub = sinon.stub(proveCoGatewayService, 'proveCoGateway');
    await proveCoGatewayService.update([auxiliaryChain]);

    SpyAssert.assert(proveGatewayStub, 0, [[]]);
  });
});
