import * as sinon from 'sinon';
import ConfirmStakeIntentService from '../../../src/services/ConfirmStakeIntentService';
import StubData from '../../test_utils/StubData';
import assert from '../../test_utils/assert';
import Repositories from "../../../src/repositories/Repositories";

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

const Web3 = require('web3');

describe('ConfirmStakeIntentService.confirmStakeIntent()', () => {
  const originWeb3 = new Web3();
  const auxiliaryWeb3 = new Web3();
  const auxiliaryWorkerAddress = '0xF1e701FbE4288a38FfFEa3084C826B810c5d5294';
  const gatewayAddress = '0x0000000000000000000000000000000000000001';
  const coGatewayAddress = '0x0000000000000000000000000000000000000002';
  let confirmStakeIntentService: ConfirmStakeIntentService;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create()
    };

    confirmStakeIntentService = new ConfirmStakeIntentService(
      config.repos.messageRepository,
      config.repos.stakeRequestRepository,
      originWeb3,
      auxiliaryWeb3,
      gatewayAddress,
      coGatewayAddress,
      auxiliaryWorkerAddress,
    );
  });

  it('ConfirmStakeIntent should work properly.', async () => {
    const gateway = StubData.gatewayRecord();
    const messageHash1 = '0x00000000000000000000000000000000000000000000000000000000000000001';
    const message1 = StubData.messageAttributes();
    message1.messageHash = messageHash1;

    const messageHash2 = '0x00000000000000000000000000000000000000000000000000000000000000002';
    const message2 = StubData.messageAttributes();
    message1.messageHash = messageHash2;

    const messages = [message1, message2];

    const spyConfirm = sinon.stub(
      confirmStakeIntentService as any,
      "confirm",
    );

    const mockTxResponse1 = "mockTxResponse1";
    spyConfirm.onCall(0).resolves(mockTxResponse1);

    const mockTxResponse2 = "mockTxResponse2";
    spyConfirm.onCall(1).resolves(mockTxResponse2);

    const transactionHashes = await confirmStakeIntentService.confirmStakeIntent(gateway, messages);

    assert.strictEqual(
      Object.keys(transactionHashes).length,
      2,
      "Invalid transactionHashes object length"
    );

    assert.strictEqual(
      transactionHashes[message1.messageHash],
      mockTxResponse1,
      "Mismatch in messageHash1"
    );

    assert.strictEqual(
      transactionHashes[message2.messageHash],
      mockTxResponse2,
      "Mismatch in messageHash2"
    );

    sinon.restore();
  });

});
