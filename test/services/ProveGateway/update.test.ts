import BigNumber from 'bignumber.js';
import * as sinon from 'sinon';
import ProveGatewayService from '../../../src/services/ProveGatewayService';
import StubData from '../../test_utils/StubData';
import SpyAssert from '../../test_utils/SpyAssert';
import assert from '../../test_utils/assert';

const Web3 = require('web3');

describe('ProveGatewayService.update()', () => {
  const originWeb3 = new Web3();
  const auxiliaryWeb3 = new Web3();
  const auxiliaryWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const auxiliaryChainId = 123;
  let proveGatewayService: ProveGatewayService;

  beforeEach(() => {
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

  it('should react to update on auxiliary chain model ', async () => {
    const originBlockHeight = new BigNumber(100);
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      auxiliaryChainId,
      originBlockHeight,
    );

    const reactToStub = sinon.stub(proveGatewayService, 'reactTo');
    await proveGatewayService.update([auxiliaryChain]);

    SpyAssert.assert(reactToStub, 1, [[originBlockHeight]]);
  });

  it('should only react to interested chainID', async () => {
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      1,
    );

    const reactToStub = sinon.stub(proveGatewayService, 'reactTo');
    await proveGatewayService.update([auxiliaryChain]);

    SpyAssert.assert(reactToStub, 0, [[]]);
  });


  it('should fail for null last origin block height', async () => {
    const auxiliaryChain = StubData.auxiliaryChainRecord(
      auxiliaryChainId,
      undefined,
    );

    sinon.stub(proveGatewayService, 'reactTo');
    await proveGatewayService.update([auxiliaryChain]);

    assert.isRejected(
      proveGatewayService.update([auxiliaryChain]),
      'Last anchored origin block height cannot be undefined.',
      'It must fail if latest origin block height is not defined',
    );
  });
});
