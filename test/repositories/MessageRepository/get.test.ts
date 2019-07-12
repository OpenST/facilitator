import 'mocha';

import BigNumber from 'bignumber.js';

import Message from '../../../src/models/Message';
import {
  MessageDirection, MessageStatus, MessageType,
} from '../../../src/repositories/MessageRepository';
import Repositories from '../../../src/repositories/Repositories';
import assert from '../../test_utils/assert';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

describe('Message::get', (): void => {
  let message: Message;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    const messageHash = '0x00000000000000000000000000000000000000000000000000000000000000333';
    const type = MessageType.Stake;
    const gatewayAddress = '0x0000000000000000000000000000000000000001';
    const sourceStatus = MessageStatus.Declared;
    const targetStatus = MessageStatus.Declared;
    const gasPrice = new BigNumber(100);
    const gasLimit = new BigNumber(200);
    const nonce = new BigNumber(1);
    const sender = '0x0000000000000000000000000000000000000002';
    const direction = MessageDirection.OriginToAuxiliary;
    const sourceDeclarationBlockHeight = new BigNumber(300);
    const secret = '0x00000000000000000000000000000000000000000000000000000000000000334';
    const hashLock = '0x00000000000000000000000000000000000000000000000000000000000000335';
    const createdAt = new Date();
    const updatedAt = new Date();

    message = new Message(
      messageHash,
      type,
      gatewayAddress,
      sourceStatus,
      targetStatus,
      gasPrice,
      gasLimit,
      nonce,
      sender,
      direction,
      sourceDeclarationBlockHeight,
      secret,
      hashLock,
      createdAt,
      updatedAt,
    );
    await config.repos.messageRepository.save(
      message,
    );
  });

  it('should pass when retrieving Message model', async (): Promise<void> => {
    const getResponse = await config.repos.messageRepository.get(
      message.messageHash,
    );

    Util.assertMessageAttributes(getResponse as Message, message);
  });

  it('should return null when querying for non-existing '
    + 'messageHash', async (): Promise<void> => {
    const nonExistingMessageHash = '0x00000000000000000000000000000000000000000000000000000000000000222';

    const getResponse = await config.repos.messageRepository.get(
      nonExistingMessageHash,
    );

    assert.strictEqual(
      getResponse,
      null,
      'Non existing message object,',
    );
  });
});
