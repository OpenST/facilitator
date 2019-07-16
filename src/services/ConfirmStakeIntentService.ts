import { interacts } from '@openst/mosaic-contracts';
import { EIP20CoGateway } from '@openst/mosaic-contracts/dist/interacts/EIP20CoGateway';
import * as assert from 'assert';
import Observer from '../observer/Observer';
import { MessageRepository } from '../repositories/MessageRepository';
import Gateway from '../models/Gateway';
import Message from '../models/Message';
import Utils from '../Utils';
import { AUXILIARY_GAS_PRICE } from '../Constants';

import StakeRequestRepository from '../repositories/StakeRequestRepository';
import Logger from '../Logger';

const Mosaic = require('@openst/mosaic.js');

const { ProofGenerator } = Mosaic.Utils;

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Class collects all non confirmed pending messages and confirms those messages.
 */
export default class ConfirmStakeIntentService extends Observer<Gateway> {
  private messageRepository: MessageRepository;

  private stakeRequestRepository: StakeRequestRepository;

  private originWeb3: object;

  private auxiliaryWeb3: object;

  private gatewayAddress: string;

  private coGatewayAddress: string;

  private auxiliaryWorkerAddress: string;

  /**
   * Constructor of class ConfirmStakeIntentService;
   *
   * @param messageRepository Instance of message repository.
   * @param stakeRequestRepository Instance of stake request repository.
   * @param originWeb3 Instance of origin chain web3.
   * @param auxiliaryWeb3 Instance of auxiliary chain web3.
   * @param gatewayAddress Origin chain gateway address.
   * @param coGatewayAddress Auxiliary chain gateway address.
   * @param auxiliaryWorkerAddress Auxiliary chain worker address.
   */
  public constructor(
    messageRepository: MessageRepository,
    stakeRequestRepository: StakeRequestRepository,
    originWeb3: object,
    auxiliaryWeb3: object,
    gatewayAddress: string,
    coGatewayAddress: string,
    auxiliaryWorkerAddress: string,
  ) {
    super();

    this.messageRepository = messageRepository;
    this.stakeRequestRepository = stakeRequestRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.gatewayAddress = gatewayAddress;
    this.coGatewayAddress = coGatewayAddress;
    this.auxiliaryWorkerAddress = auxiliaryWorkerAddress;
  }

  /**
   * This method reacts on changes when GatewayProven entity is received.
   *
   * Gateway model first object is selected because of update argument interface. From
   * ProveGatewayHandler always single Gateway model is passed.
   *
   * Messages to be send for confirmation is fetched and confirmStakeIntent is called.
   *
   * @param gateway List of Gateway models.
   */
  public async update(gateway: Gateway[]): Promise<void> {
    assert(gateway.length === 1);
    const provenGateway: Gateway = gateway[0];
    const messages: Message[] = await this.messageRepository.getMessagesForConfirmation(
      provenGateway.gatewayAddress,
      provenGateway.lastRemoteGatewayProvenBlockHeight!,
    );

    await this.confirmStakeIntent(provenGateway, messages);
  }

  /**
   * Collects all confirmStakeIntent promises and transaction is sent.
   *
   * @param gateway Instance of Gateway model object.
   * @param messages List of message models.
   */
  private async confirmStakeIntent(gateway: Gateway, messages: Message[]):
  Promise<Record<string, string>> {
    if (messages.length === 0) {
      return {};
    }

    const proofGenerator = new ProofGenerator(
      this.originWeb3,
      this.auxiliaryWeb3,
    );

    const transactionHashes: Record<string, string> = {};
    const promises = [];
    for (let i = 0; i < messages.length; i += 1) {
      const promise = this.confirm(proofGenerator, messages[i], gateway)
        .then((transactionHash) => {
          const message = messages[i];
          Logger.info(`Message: ${message.messageHash} confirm transaction hash: ${transactionHash}`);
          transactionHashes[message.messageHash] = transactionHash;
        });
      promises.push(promise);
    }
    await Promise.all(promises);
    return transactionHashes;
  }

  /**
   * Generates outbox proof for a messageHash and sends confirmStakeIntent transaction.
   *
   * @param proofGenerator Instance of ProofGenerator class.
   * @param message Instance of Message model.
   * @param gateway Instance of Gateway model.
   */
  private async confirm(proofGenerator: any, message: Message, gateway: Gateway):
  Promise<string> {
    const proofData = await proofGenerator.getOutboxProof(
      this.gatewayAddress,
      [message.messageHash],
      gateway.lastRemoteGatewayProvenBlockHeight,
    );
    const eip20CoGateway: EIP20CoGateway = interacts.getEIP20CoGateway(
      this.auxiliaryWeb3,
      this.coGatewayAddress,
    );
    const transactionOptions = {
      from: this.auxiliaryWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };
    const stakeRequest = await this.stakeRequestRepository.getByMessageHash(message.messageHash);
    if (stakeRequest === null) {
      throw new Error(`Invalid stakeRequest for message: ${message.messageHash}`);
    }
    const rawTx = await Promise.resolve(eip20CoGateway.methods.confirmStakeIntent(
      message.sender!,
      message.nonce!.toString(),
      stakeRequest.beneficiary!,
      stakeRequest.amount!.toString(),
      message.gasPrice!.toString(),
      message.gasLimit!.toString(),
      message.hashLock!,
      proofData.blockNumber.toString(),
      proofData.storageProof,
    ));
    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
    );
  }
}
