import * as sinon from 'sinon';
import ConfirmStakeIntentService from '../../../src/services/ConfirmStakeIntentService';
import StubData from '../../test_utils/StubData';
import SpyAssert from '../../test_utils/SpyAssert';
import Repositories from "../../../src/repositories/Repositories";
import Message from "../../../src/models/Message";

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

const Web3 = require('web3');

describe('ConfirmStakeIntentService.update()', () => {
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

  it('should react to update on auxiliary chain model ', async () => {
    const gateway = StubData.gatewayRecord();

    const reactToStub = sinon.stub(confirmStakeIntentService, 'confirmStakeIntent');
    const messages: Message[] = [];
    const spyGetMessagesForConfirmation = sinon.replace(
      config.repos.messageRepository,
      'getMessagesForConfirmation',
      sinon.fake.resolves(messages),
    );
    await confirmStakeIntentService.update([gateway]);

    SpyAssert.assert(reactToStub, 1, [[gateway, messages]]);
    SpyAssert.assert(
      spyGetMessagesForConfirmation,
      1,
      [[gateway.gatewayAddress, gateway.lastRemoteGatewayProvenBlockHeight]],
    );
  });

});
