import 'mocha';
import BigNumber from 'bignumber.js';

import Repositories from '../../../src/repositories/Repositories';

import {
  MessageType,
  MessageStatus,
  MessageDirection,
} from '../../../src/repositories/MessageRepository';

import Message from '../../../src/models/Message';
import Util from './util';

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import assert from "../../test_utils/assert";

chai.use(chaiAsPromised);

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

describe('MessageRepository::save', (): void => {
  let messageHash:  string;
  let type: string;
  let gatewayAddress: string;
  let sourceStatus: string;
  let targetStatus: string;
  let gasPrice: BigNumber;
  let gasLimit: BigNumber;
  let nonce: BigNumber;
  let sender: string;
  let direction: string;
  let sourceDeclarationBlockHeight: BigNumber;
  let secret: string;
  let hashLock: string;
  let createdAt: Date;
  let updatedAt: Date;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    messageHash = '0x00000000000000000000000000000000000000000000000000000000000000333';
    type = MessageType.Stake;
    gatewayAddress = '0x0000000000000000000000000000000000000001';
    sourceStatus = MessageStatus.Declared;
    targetStatus = MessageStatus.Declared;
    gasPrice = new BigNumber(100);
    gasLimit = new BigNumber(200);
    nonce = new BigNumber(1);
    sender = '0x0000000000000000000000000000000000000002';
    direction = MessageDirection.OriginToAuxiliary;
    sourceDeclarationBlockHeight = new BigNumber(300);
    secret = '0x00000000000000000000000000000000000000000000000000000000000000334';
    hashLock = '0x00000000000000000000000000000000000000000000000000000000000000335';
    createdAt = new Date();
    updatedAt = new Date();
  });

  it('should pass when creating Message model.', async (): Promise<void> => {
    const message = new Message(
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
    const createdMessage = await config.repos.messageRepository.save(
      message,
    );

    Util.assertMessageAttributes(createdMessage, message);
  });

  it('Throws if a message '
    + 'with the same message hash already exists.', async (): Promise<void> => {
    const message = new Message(
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

    return assert.isRejected(
      config.repos.messageRepository.save(
        message,
      ),
      /^Failed to create a message*/,
      'Creation should fail as a message with the same messageHash already exists.',
    );
  });

  it('should pass when updating Message model', async (): Promise<void> => {
    const message = new Message(
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

    message.sourceStatus = MessageStatus.Progressed;

    const updatedMessage = await config.repos.messageRepository.save(
      message,
    );

    Util.assertMessageAttributes(updatedMessage, message);
  });

  it('Update should fail for a non existing messageHash ', async (): Promise<void> => {
    const nonExistingMessageHash = '0x00000000000000000000000000000000000000000000000000000000000000222';
    const message = new Message(
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
    const updated = await config.repos.messageRepository.save(
      message,
    );

    assert.isNotOk(
      updated,
      'The messageHash in the passed attributes does not exist, hence no update.',
    );

    const updatedMessage = await config.repos.messageRepository.get(
      nonExistingMessageHash,
    );

    return assert.strictEqual(
      updatedMessage,
      null,
    );
  });

});
