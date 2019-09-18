import 'mocha';

import BigNumber from 'bignumber.js';

import MessageTransferRequest from '../../../src/models/MessageTransferRequest';
import Repositories from '../../../src/repositories/Repositories';
import assert from '../../test_utils/assert';
import StubData from '../../test_utils/StubData';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('MessageTransferRequestRepository::getByMessageHash', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks retrieval of MessageTransferRequest by messageHash.', async (): Promise<void> => {
    const messageHash = '0x00000000000000000000000000000000000000000000000000000000000000333';
    const message = StubData.messageAttributes(
      messageHash,
      '0x0000000000000000000000000000000000000001',
      new BigNumber(300),
    );
    await config.repos.messageRepository.save(
      message,
    );

    const request = StubData.getAStakeRequest('requestHash');
    request.messageHash = messageHash;

    await config.repos.messageTransferRequestRepository.save(
      request,
    );

    const requestOutput = await config.repos.messageTransferRequestRepository.getByMessageHash(
      messageHash,
    );

    assert.notStrictEqual(
      requestOutput,
      null,
      'Stake/Redeem request should exists as it has been just created.',
    );

    Util.checkInputAgainstOutput(
      request,
      requestOutput as MessageTransferRequest,
    );
  });

  it('Checks retrieval of non-existing MessageTransferRequest by messageHash.', async (): Promise<void> => {
    const request = await config.repos.messageTransferRequestRepository.getByMessageHash(
      'nonExistingMessageHash',
    );

    assert.strictEqual(
      request,
      null,
      'MessageTransferRequest with \'nonExistingMessageHash\' does not exist.',
    );
  });
});
