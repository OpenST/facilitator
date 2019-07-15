import 'mocha';
import BigNumber from 'bignumber.js';
import StakeRequest from '../../../src/models/StakeRequest';
import Repositories from '../../../src/repositories/Repositories';
import Util from './util';
import assert from '../../test_utils/assert';
import Message from '../../../src/models/Message';
import {
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../../../src/repositories/MessageRepository';

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
    const message = new Message(
      messageHash,
      MessageType.Stake,
      '0x0000000000000000000000000000000000000001',
      MessageStatus.Declared,
      MessageStatus.Declared,
      new BigNumber(100),
      new BigNumber(200),
      new BigNumber('1'),
      '0x0000000000000000000000000000000000000002',
      MessageDirection.OriginToAuxiliary,
      new BigNumber(300),
      '0x00000000000000000000000000000000000000000000000000000000000000334',
      '0x00000000000000000000000000000000000000000000000000000000000000335',
    );
    await config.repos.messageRepository.save(
      message,
    );

    const stakeRequest = new StakeRequest(
      'stakeRequestHash',
      new BigNumber('1'),
      'beneficiary',
      new BigNumber('2'),
      new BigNumber('3'),
      new BigNumber('4'),
      'gateway',
      'stakerProxy',
      messageHash,
    );

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
