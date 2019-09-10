import 'mocha';

import BigNumber from 'bignumber.js';

import RedeemRequest from '../../../src/models/RedeemRequest';
import Repositories from '../../../src/repositories/Repositories';
import assert from '../../test_utils/assert';
import StubData from '../../test_utils/StubData';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('RedeemRequestRepository::getByMessageHash', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks retrieval of RedeemRequest by messageHash.', async (): Promise<void> => {
    const messageHash = '0x00000000000000000000000000000000000000000000000000000000000000333';
    const message = StubData.messageAttributes(
      messageHash,
      '0x0000000000000000000000000000000000000001',
      new BigNumber(300),
    );
    await config.repos.messageRepository.save(
      message,
    );

    const redeemRequest = StubData.getARedeemRequest('redeemRequestHash');
    redeemRequest.messageHash = messageHash;

    await config.repos.redeemRequestRepository.save(
      redeemRequest,
    );

    const redeemRequestOutput = await config.repos.redeemRequestRepository.getByMessageHash(
      messageHash,
    );

    assert.notStrictEqual(
      redeemRequestOutput,
      null,
      'Redeem request should exists as it has been just created.',
    );

    Util.checkInputAgainstOutput(
      redeemRequest,
      redeemRequestOutput as RedeemRequest,
    );
  });

  it('Checks retrieval of non-existing RedeemRequest by messageHash.', async (): Promise<void> => {
    const redeemRequest = await config.repos.redeemRequestRepository.getByMessageHash(
      'nonExistingMessageHash',
    );

    assert.strictEqual(
      redeemRequest,
      null,
      'Redeem request with \'nonExistingMessageHash\' does not exist.',
    );
  });
});
