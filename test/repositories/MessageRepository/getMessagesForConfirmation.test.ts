import 'mocha';

import { assert } from 'chai';

import BigNumber from 'bignumber.js';
import Repositories from '../../../src/repositories/Repositories';
import Message from '../../../src/models/Message';
import {
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../../../src/repositories/MessageRepository';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

const type = MessageType.Stake;
const gatewayAddress = '0x0000000000000000000000000000000000000001';
const sourceStatus = MessageStatus.Declared;
const targetStatus = MessageStatus.Undeclared;
const gasPrice = new BigNumber(10);
const gasLimit = new BigNumber(20);
const nonce = new BigNumber(1);
const sender = '0x0000000000000000000000000000000000000011';
const direction = MessageDirection.OriginToAuxiliary;
const sourceDeclarationBlockHeight = new BigNumber(100);
const secret = '0x00000000000000000000000000000000000000000000000000000000000000334';
const hashLock = '0x00000000000000000000000000000000000000000000000000000000000000335';
const createdAt = new Date();
const updatedAt = new Date();

let message1: Message;
let message2: Message;

describe('MessageRepository::getMessagesForConfirmation', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    const messageHash1 = '0x00000000000000000000000000000000000000000000000000000000000000333';
    message1 = new Message(
      messageHash1,
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
    // Save message1
    await config.repos.messageRepository.save(
      message1,
    );

    // Save message2
    const messageHash2 = '0x00000000000000000000000000000000000000000000000000000000000000334';
    message2 = new Message(
      messageHash2,
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
      message2,
    );
  });

  it('should fetch all messages to be sent for confirmation.', async (): Promise<void> => {
    const gatewayProvenBlockHeight = new BigNumber(200);
    const responseMessages = await config.repos.messageRepository.getMessagesForConfirmation(
      gatewayAddress, gatewayProvenBlockHeight,
    );
    Util.assertMessageAttributes(responseMessages[0], message1);
    Util.assertMessageAttributes(responseMessages[1], message2);
  });

  it('should not fetch messages which does not need to be sent for confirmation.', async (): Promise<void> => {
    const gatewayProvenBlockHeight = new BigNumber(200);
    const invalidGatewayAddress = '0x0000000000000000000000000000000000000099';
    const responseMessages = await config.repos.messageRepository.getMessagesForConfirmation(
      invalidGatewayAddress, gatewayProvenBlockHeight,
    );
    assert.deepEqual(
      responseMessages,
      [],
      'No messages for confirmation.',
    );
  });

  it('should not fetch messages if gatewayProvenBlockHeight is less than'
    + ' sourceDeclarationBlockHeight'
    + ' .', async (): Promise<void> => {
    const gatewayProvenBlockHeight = new BigNumber(50);
    const responseMessages = await config.repos.messageRepository.getMessagesForConfirmation(
      gatewayAddress, gatewayProvenBlockHeight,
    );

    assert.deepEqual(
      responseMessages,
      [],
      'No messages for confirmation.',
    );
  });
});
