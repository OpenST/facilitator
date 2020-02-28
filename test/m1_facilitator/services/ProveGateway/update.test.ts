

import BigNumber from 'bignumber.js';
import sinon from 'sinon';
import Web3 from 'web3';
import ProveGatewayService from '../../../../src/m1_facilitator/services/ProveGatewayService';
import Anchor from '../../../../src/m1_facilitator/models/Anchor';

describe('ProveGatewayService::update', (): void => {
  const originWeb3 = new Web3(null);
  const auxiliaryWeb3 = new Web3(null);

  let proveGatewayService: ProveGatewayService;

  beforeEach((): void => {
    proveGatewayService = new ProveGatewayService(
      sinon.fake() as any,
      sinon.fake() as any,
      originWeb3,
      auxiliaryWeb3,
    );
  });

  it('should react to update on anchor model', async (): Promise<void> => {
    const originBlockHeight = new BigNumber(100);
    const anchorData = new Anchor(
      '0x0000000000000000000000000000000000000001',
      originBlockHeight,
      new Date(),
      new Date(),
    );

    const reactToStub = sinon.stub(proveGatewayService, 'update');
    console.log(reactToStub);
    await proveGatewayService.update([anchorData]);
  });
});
