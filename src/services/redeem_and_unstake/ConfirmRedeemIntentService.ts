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
import { ProofGenerator } from '@openst/mosaic-proof';

import { EIP20Gateway } from '@openst/mosaic-contracts/dist/interacts/EIP20Gateway';
import { MESSAGE_BOX_OFFSET, ORIGIN_GAS_PRICE } from '../../Constants';
import Logger from '../../Logger';
import Gateway from '../../models/Gateway';
import Message from '../../models/Message';
import MessageTransferRequest from '../../models/MessageTransferRequest';
import Observer from '../../observer/Observer';
import { MessageDirection, MessageRepository } from '../../repositories/MessageRepository';
import MessageTransferRequestRepository from '../../repositories/MessageTransferRequestRepository';
import Utils from '../../Utils';

/**
 * Class collects all non confirmed pending messages for redeem and confirms those messages.
 */
export default class ConfirmRedeemIntentService extends Observer<Gateway> {
  private messageRepository: MessageRepository;

  private messageTransferRequestRepository: MessageTransferRequestRepository;

  private originWeb3: Web3;

  private auxiliaryWeb3: Web3;

  private gatewayAddress: string;

  private coGatewayAddress: string;

  private originWorkerAddress: string;

  /**
   * Constructor of class ConfirmRedeemIntentService;
   *
   * @param messageRepository Instance of message repository.
   * @param messageTransferRequestRepository Instance of request repository.
   * @param originWeb3 Instance of origin chain web3.
   * @param auxiliaryWeb3 Instance of auxiliary chain web3.
   * @param gatewayAddress Origin chain gateway address.
   * @param coGatewayAddress Auxiliary chain gateway address.
   * @param originWorkerAddress Auxiliary chain worker address.
   */
  public constructor(
    messageRepository: MessageRepository,
    messageTransferRequestRepository: MessageTransferRequestRepository,
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    gatewayAddress: string,
    coGatewayAddress: string,
    originWorkerAddress: string,
  ) {
    super();

    this.messageRepository = messageRepository;
    this.messageTransferRequestRepository = messageTransferRequestRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.gatewayAddress = gatewayAddress;
    this.coGatewayAddress = coGatewayAddress;
    this.originWorkerAddress = originWorkerAddress;
  }

  /**
   * This method reacts on changes when GatewayProven entity is received.
   *
   * Gateway model first object is selected because of update argument interface. From
   * ProveGatewayHandler always single Gateway model is passed.
   *
   * Messages to be send for confirmation is fetched and confirmRedeemIntent is called.
   *
   * @param gateway List of Gateway models.
   */
  public async update(gateway: Gateway[]): Promise<void> {
    Logger.debug('Confirm redeem intent service invoked');
    assert(
      gateway.length === 1,
      'There should be only 1 gateway record',
    );
    const provenGateway: Gateway = gateway[0];
    const messages: Message[] = await this.messageRepository.getMessagesForConfirmation(
      provenGateway.gatewayAddress,
      provenGateway.lastRemoteGatewayProvenBlockHeight,
      MessageDirection.AuxiliaryToOrigin,
    );

    await this.confirmRedeemIntent(provenGateway, messages);
  }

  /**
   * Collects all ConfirmRedeemIntent promises and transaction is sent.
   *
   * @param gateway Instance of Gateway model object.
   * @param messages List of message models.
   */
  private async confirmRedeemIntent(
    gateway: Gateway,
    messages: Message[],
  ): Promise<Record<string, string>> {
    if (messages.length === 0) {
      return {};
    }

    const proofGenerator = new ProofGenerator(
      this.auxiliaryWeb3,
    );

    const transactionHashes: Record<string, string> = {};

    const promises = messages
      .filter((message): boolean => message.isValidSecret())
      .map(async (message): Promise<void> => this.confirm(proofGenerator, message, gateway)
        .then((transactionHash): void => {
          Logger.debug(`Message: ${message.messageHash} confirm transaction hash: ${transactionHash}`);
          transactionHashes[message.messageHash] = transactionHash;
        }).catch((error) => {
          Logger.error('ConfirmRedeemIntentServiceError ', error);
        }));

    await Promise.all(promises);

    return transactionHashes;
  }

  /**
   * Generates outbox proof for a messageHash and sends ConfirmRedeemIntent transaction.
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
    Logger.debug(`Generating proof for confirm redeem intent for gateway ${this.coGatewayAddress} and message hash ${message.messageHash}`);
    const proofData = await proofGenerator.getOutboxProof(
      this.coGatewayAddress,
      [message.messageHash],
      gateway.lastRemoteGatewayProvenBlockHeight.toString(10),
      MESSAGE_BOX_OFFSET, // fixme #141
    );
    if (proofData.storageProof[0].value === '0') {
      return Promise.reject(new Error('Storage proof is invalid'));
    }

    Logger.debug(`Generated proof ${JSON.stringify(proofData)}`);
    const eip20Gateway: EIP20Gateway = interacts.getEIP20Gateway(
      this.originWeb3,
      this.gatewayAddress,
    );

    const transactionOptions = {
      from: this.originWorkerAddress,
      gasPrice: ORIGIN_GAS_PRICE,
    };

    const redeemRequest = await this.messageTransferRequestRepository.getByMessageHash(
      message.messageHash,
    );

    const rawTx = eip20Gateway.methods.confirmRedeemIntent(
      message.sender as string,
      (message.nonce as BigNumber).toString(10),
      (redeemRequest as MessageTransferRequest).beneficiary,
      ((redeemRequest as MessageTransferRequest).amount).toString(10),
      (message.gasPrice as BigNumber).toString(10),
      (message.gasLimit as BigNumber).toString(10),
      gateway.lastRemoteGatewayProvenBlockHeight.toString(10),
      (message.hashLock as string),
      proofData.storageProof[0].serializedProof,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
      this.originWeb3,
    );
  }
}
