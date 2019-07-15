import 'mocha';
import BigNumber from 'bignumber.js';
import StakeRequest from '../../../src/models/StakeRequest';
import Repositories from '../../../src/repositories/Repositories';
import Util from './util';
import assert from '../../test_utils/assert';
import StubData from "../../test_utils/StubData";

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

describe('StakeRequestRepository::getByMessageHash', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
  });

  it('Checks retrieval of StakeRequest by messageHash.', async (): Promise<void> => {
    const messageHash = '0x00000000000000000000000000000000000000000000000000000000000000333';
    const message = StubData.messageAttributes(
      messageHash,
      '0x0000000000000000000000000000000000000001',
      new BigNumber(300)
    );
    await config.repos.messageRepository.save(
      message,
    );

    const stakeRequest = StubData.getAStakeRequest('stakeRequestHash');
    stakeRequest.messageHash = messageHash;

    await config.repos.stakeRequestRepository.save(
      stakeRequest,
    );

    const stakeRequestOutput = await config.repos.stakeRequestRepository.getByMessageHash(
      messageHash,
    );

    assert.notStrictEqual(
      stakeRequestOutput,
      null,
      'Stake request should exists as it has been just created.',
    );

    Util.checkInputAgainstOutput(
      stakeRequest,
      stakeRequestOutput as StakeRequest,
    );
  });

  it('Checks retrieval of non-existing StakeRequest by messageHash.', async (): Promise<void> => {
    const stakeRequest = await config.repos.stakeRequestRepository.getByMessageHash(
      'nonExistingMessageHash',
    );

    assert.strictEqual(
      stakeRequest,
      null,
      'Stake request with \'nonExistingMessageHash\' does not exist.',
    );
  });
});
