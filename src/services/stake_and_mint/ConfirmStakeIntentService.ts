// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------


/* eslint-disable import/no-unresolved */

import assert from 'assert';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { interacts } from '@openst/mosaic-contracts';
import { EIP20CoGateway } from '@openst/mosaic-contracts/dist/interacts/EIP20CoGateway';
import { ProofGenerator } from '@openst/mosaic-proof';

import { AUXILIARY_GAS_PRICE } from '../../Constants';
import Logger from '../../Logger';
import Gateway from '../../models/Gateway';
import Message from '../../models/Message';
import MessageTransferRequest from '../../models/MessageTransferRequest';
import Observer from '../../observer/Observer';
import { MessageDirection, MessageRepository } from '../../repositories/MessageRepository';
import MessageTransferRequestRepository from '../../repositories/MessageTransferRequestRepository';
import Utils from '../../Utils';
import { GatewayType } from '../../repositories/GatewayRepository';

/**
 * Class collects all non confirmed pending messages and confirms those messages.
 */
export default class ConfirmStakeIntentService extends Observer<Gateway> {
  private messageRepository: MessageRepository;

  private messageTransferRequestRepository: MessageTransferRequestRepository;

  private originWeb3: Web3;

  private auxiliaryWeb3: Web3;

  private gatewayAddress: string;

  private coGatewayAddress: string;

  private auxiliaryWorkerAddress: string;

  /**
   * Constructor of class ConfirmStakeIntentService;
   *
   * @param messageRepository Instance of message repository.
   * @param messageTransferRequestRepository Instance of message transfer request repository.
   * @param originWeb3 Instance of origin chain web3.
   * @param auxiliaryWeb3 Instance of auxiliary chain web3.
   * @param gatewayAddress Origin chain gateway address.
   * @param coGatewayAddress Auxiliary chain gateway address.
   * @param auxiliaryWorkerAddress Auxiliary chain worker address.
   */
  public constructor(
    messageRepository: MessageRepository,
    messageTransferRequestRepository: MessageTransferRequestRepository,
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    gatewayAddress: string,
    coGatewayAddress: string,
    auxiliaryWorkerAddress: string,
  ) {
    super();

    this.messageRepository = messageRepository;
    this.messageTransferRequestRepository = messageTransferRequestRepository;
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
    Logger.debug('Confirm stake intent service invoked');
    assert(
      gateway.length === 1,
      'There should be only 1 gateway record',
    );
    const provenGateway: Gateway = gateway[0];
    const messages: Message[] = await this.messageRepository.getMessagesForConfirmation(
      provenGateway.gatewayAddress,
      provenGateway.lastRemoteGatewayProvenBlockHeight,
      MessageDirection.OriginToAuxiliary,
    );

    await this.confirmStakeIntent(provenGateway, messages);
  }

  /**
   * Collects all confirmStakeIntent promises and transaction is sent.
   *
   * @param gateway Instance of Gateway model object.
   * @param messages List of message models.
   */
  private async confirmStakeIntent(
    gateway: Gateway,
    messages: Message[],
  ): Promise<Record<string, string>> {
    if (messages.length === 0) {
      return {};
    }

    const proofGenerator = new ProofGenerator(
      this.originWeb3,
    );

    const transactionHashes: Record<string, string> = {};

    const promises = messages
      .filter((message): boolean => message.isValidSecret())
      .map(async (message): Promise<void> => this.confirm(proofGenerator, message, gateway)
        .then((transactionHash): void => {
          Logger.debug(`Message: ${message.messageHash} confirm transaction hash: ${transactionHash}`);
          transactionHashes[message.messageHash] = transactionHash;
        }).catch((error) => {
          Logger.error('confirmStakeIntentServiceError ', error);
        }));

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
  private async confirm(
    proofGenerator: any,
    message: Message,
    gateway: Gateway,
  ): Promise<string> {
    Logger.debug(`Generation proof for confirm stake intent for gateway ${this.gatewayAddress} and message hash ${message.messageHash}`);
    const messageBoxOffset = await Utils.getMessageBoxOffset(
      this.originWeb3,
      GatewayType.Origin,
      this.gatewayAddress,
    );
    console.log('messageBoxOffset in confirmstakeintentservice :- ',messageBoxOffset);
    const proofData = await proofGenerator.getOutboxProof(
      this.gatewayAddress,
      [message.messageHash],
      gateway.lastRemoteGatewayProvenBlockHeight.toString(10),
      messageBoxOffset,
    );
    if (proofData.storageProof[0].value === '0') {
      return Promise.reject(new Error('Storage proof is invalid'));
    }

    Logger.debug(`Generated proof ${JSON.stringify(proofData)}`);
    const eip20CoGateway: EIP20CoGateway = interacts.getEIP20CoGateway(
      this.auxiliaryWeb3,
      this.coGatewayAddress,
    );

    const transactionOptions = {
      from: this.auxiliaryWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };

    const stakeRequest = await this.messageTransferRequestRepository.getByMessageHash(
      message.messageHash,
    );
    assert(stakeRequest !== null);

    assert(message.nonce !== undefined);
    assert(message.gasPrice !== undefined);
    assert(message.gasLimit !== undefined);
    assert(message.hashLock !== undefined);
    assert((stakeRequest as MessageTransferRequest).beneficiary !== undefined);
    assert((stakeRequest as MessageTransferRequest).amount !== undefined);

    const rawTx = eip20CoGateway.methods.confirmStakeIntent(
      message.sender as string,
      (message.nonce as BigNumber).toString(10),
      (stakeRequest as MessageTransferRequest).beneficiary,
      ((stakeRequest as MessageTransferRequest).amount).toString(10),
      (message.gasPrice as BigNumber).toString(10),
      (message.gasLimit as BigNumber).toString(10),
      (message.hashLock as string),
      gateway.lastRemoteGatewayProvenBlockHeight.toString(10),
      proofData.storageProof[0].serializedProof,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
      this.auxiliaryWeb3,
    );
  }
}
