import 'mocha';

import BigNumber from 'bignumber.js';

import Message from '../../../src/models/Message';
import Repositories from '../../../src/repositories/Repositories';
import assert from '../../test_utils/assert';
import StubData from '../../test_utils/StubData';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}
let config: TestConfigInterface;

let gatewayAddress: string;
let message1: Message;
let message2: Message;

describe('MessageRepository::getMessagesForConfirmation', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    gatewayAddress = '0x0000000000000000000000000000000000000001';

    const messageHash1 = '0x00000000000000000000000000000000000000000000000000000000000000333';
    const sourceDeclarationBlockHeight1 = new BigNumber(100);
    message1 = StubData.messageAttributes(
      messageHash1,
      gatewayAddress,
      sourceDeclarationBlockHeight1,
    );
    // Save message1
    await config.repos.messageRepository.save(
      message1,
    );

    // Save message2
    const messageHash2 = '0x00000000000000000000000000000000000000000000000000000000000000334';
    const sourceDeclarationBlockHeight2 = new BigNumber(101);
    message2 = StubData.messageAttributes(
      messageHash2,
      gatewayAddress,
      sourceDeclarationBlockHeight2,
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

  it('should not fetch messages for other gateways.', async (): Promise<void> => {
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
