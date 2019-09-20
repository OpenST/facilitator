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

import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { interacts } from '@openst/mosaic-contracts';
import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';

import { RedeemPool } from '@openst/mosaic-contracts/dist/interacts/RedeemPool';
import { AUXILIARY_GAS_PRICE } from '../../Constants';
import Logger from '../../Logger';
import Message from '../../models/Message';
import MessageTransferRequest from '../../models/MessageTransferRequest';
import Observer from '../../observer/Observer';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../../repositories/MessageRepository';
import Repositories from '../../repositories/Repositories';
import MessageTransferRequestRepository, { RequestType } from '../../repositories/MessageTransferRequestRepository';
import Utils from '../../Utils';

/**
 * Class collects all non accepted redeem requests on a trigger and accepts
 * those redeem requests in parallel.
 */
export default class AcceptRedeemRequestService extends Observer<MessageTransferRequest> {
  /* Storage */

  private web3: Web3;

  private messageTransferRequestRepository: MessageTransferRequestRepository;

  private messageRepository: MessageRepository;

  private redeemPoolAddress: string;

  private auxiliaryWorkerAddress: string;


  /* Public Functions */

  /**
   * Constructor
   *
   * @param repos Repository object.
   * @param web3 Web3 instance.
   * @param redeemPoolAddress Redeem pool contract address.
   * @param auxiliaryWorkerAddress Auxiliary worker address.
   */
  public constructor(
    repos: Repositories,
    web3: Web3,
    redeemPoolAddress: string,
    auxiliaryWorkerAddress: string,
  ) {
    super();

    this.web3 = web3;
    this.messageTransferRequestRepository = repos.messageTransferRequestRepository;
    this.messageRepository = repos.messageRepository;
    this.redeemPoolAddress = redeemPoolAddress;
    this.auxiliaryWorkerAddress = auxiliaryWorkerAddress;
  }

  /**
   * This method react on changes in MessageTransferRequest model.
   * @param redeemRequests Array of redeem requests.
   */
  public async update(redeemRequests: MessageTransferRequest[]): Promise<void> {
    Logger.debug('Accept redeem request service invoked');
    const nonAcceptedRedeemRequests = redeemRequests.filter(
      (redeemRequest: MessageTransferRequest): boolean =>
        (redeemRequest.requestType === RequestType.Redeem) && !redeemRequest.messageHash,
    );

    await this.acceptRedeemRequests(nonAcceptedRedeemRequests);
  }


  /* Private Functions */

  /**
   * Collects acceptRedeemRequest transaction promise and executed them.
   *
   * @param redeemRequests Array of redeem requests.
   */
  private async acceptRedeemRequests(redeemRequests: MessageTransferRequest[]): Promise<void> {
    const redeemRequestPromises = [];
    for (let i = 0; i < redeemRequests.length; i += 1) {
      redeemRequestPromises.push(
        this.acceptRedeemRequest(redeemRequests[i]).catch((error) => {
          Logger.error('acceptRedeemRequestService error', error);
        }),
      );
    }

    await Promise.all(redeemRequestPromises);
  }

  /**
   * It sends accept redeem transaction and updates messageHash in MessageTransferRequest
   * repository.
   * @param redeemRequest Redeem request object.
   */
  private async acceptRedeemRequest(redeemRequest: MessageTransferRequest): Promise<void> {
    const { secret, hashLock } = Utils.generateSecret();

    const transactionHash = await this.sendAcceptRedeemRequestTransaction(
      redeemRequest, hashLock,
    );
    Logger.info(`Accept redeem request transaction hash ${transactionHash}`);
    const messageHash = await this.createMessageInRepository(
      redeemRequest, secret, hashLock,
    );

    await this.updateMessageHash(
      redeemRequest.requestHash,
      messageHash,
      redeemRequest.blockNumber,
    );
  }

  /**
   * Fetches bounty amount from contract and returns bounty amount.
   *
   * @param redeemRequest Redeem request object.
   * @return {string} Bounty amount.
   */
  private async getBountyAmount(redeemRequest: MessageTransferRequest): Promise<string> {
    const eip20CoGatewayInteract = interacts.getEIP20CoGateway(
      this.web3,
      redeemRequest.gateway,
    );

    const bounty = await eip20CoGatewayInteract.methods.bounty().call();
    Logger.debug(`Bounty of cogateway ${redeemRequest.gateway} is ${bounty}`);
    return bounty;
  }

  /**
   * This method sends accept redeem request transaction.
   * @param redeemRequest Redeem request object.
   * @param hashLock Hash lock passed in accept request argument.
   */
  private async sendAcceptRedeemRequestTransaction(
    redeemRequest: MessageTransferRequest, hashLock: string,
  ): Promise<string> {
    Logger.debug(`Sending accept request transaction for redeemer proxy ${redeemRequest.senderProxy}`);
    const redeemPool: RedeemPool = interacts.getRedeemPool(this.web3, this.redeemPoolAddress);

    const rawTx: TransactionObject<string> = redeemPool.methods.acceptRedeemRequest(
      (redeemRequest.amount as BigNumber).toString(10),
      (redeemRequest.beneficiary as string),
      (redeemRequest.gasPrice as BigNumber).toString(10),
      (redeemRequest.gasLimit as BigNumber).toString(10),
      (redeemRequest.nonce as BigNumber).toString(10),
      (redeemRequest.sender as string),
      (redeemRequest.gateway as string),
      hashLock,
    );
    const bounty = await this.getBountyAmount(redeemRequest);
    return Utils.sendTransaction(rawTx, {
      from: this.auxiliaryWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
      value: bounty,
    }, this.web3);
  }

  /**
   * Creates entry in message repository.
   * @param redeemRequest Redeem request object.
   * @param secret Secret of the redeem request.
   * @param hashLock Hash lock for the redeem request.
   * @return Returns message hash.
   */
  private async createMessageInRepository(
    redeemRequest: MessageTransferRequest,
    secret: string,
    hashLock: string,
  ): Promise<string> {
    const redeemIntentHash = this.calculateRedeemIntentHash(
      redeemRequest.amount!,
      redeemRequest.beneficiary!,
      redeemRequest.gateway!,
    );
    const messageHash = Utils.calculateMessageHash(
      this.web3,
      redeemRequest,
      hashLock,
      redeemIntentHash
    );
    Logger.debug(`Creating message for message hash ${messageHash}`);

    const message = new Message(
      messageHash,
      MessageType.Redeem,
      redeemRequest.gateway as string,
      MessageStatus.Undeclared,
      MessageStatus.Undeclared,
      redeemRequest.gasPrice as BigNumber,
      redeemRequest.gasLimit as BigNumber,
      redeemRequest.nonce as BigNumber,
      redeemRequest.senderProxy as string,
      MessageDirection.AuxiliaryToOrigin,
      new BigNumber(0),
      secret,
      hashLock,
    );

    await this.messageRepository.save(message);
    Logger.debug(`Message object saved for message hash ${message.messageHash}`);
    return messageHash;
  }

  /**
   * Updates the message hash in messageTransferRequest repository after
   * accepting redeem request. Accepting redeem requests adds a new entry
   * into messages' repository with a message hash. That exact message
   * hash is updated here in messageTransferRequest repository.
   *
   * @param redeemRequestHash Redeem request hash.
   * @param messageHash Message hash of redeem request.
   * @param blockNumber Block number at which requestRedeem got executed.
   */
  private async updateMessageHash(
    redeemRequestHash: string,
    messageHash: string,
    blockNumber: BigNumber,
  ): Promise<void> {
    const redeemRequest = new MessageTransferRequest(
      redeemRequestHash,
      RequestType.Redeem,
      blockNumber,
    );
    redeemRequest.messageHash = messageHash;
    Logger.debug('Updating message hash in message transfer request repository');
    await this.messageTransferRequestRepository.save(redeemRequest);
  }

  /**
   * Calculates redeem intent hash.
   *
   * @param amount Beneficiary amount.
   * @param beneficiary Beneficiary address.
   * @param cogateway CoGateway contract address.
   * @return Returns redeem intent hash.
   */
  private calculateRedeemIntentHash(
    amount: BigNumber,
    beneficiary: string,
    cogateway: string,
  ): string {
    const redeemIntentTypeHash = this.web3.utils.sha3(
      this.web3.eth.abi.encodeParameter(
        'string',
        'RedeemIntent(uint256 amount,address beneficiary,address gateway)',
      ),
    );

    return this.web3.utils.sha3(
      this.web3.eth.abi.encodeParameters(
        [
          'bytes32',
          'uint256',
          'address',
          'address',
        ],
        [
          redeemIntentTypeHash,
          amount.toString(10),
          beneficiary,
          cogateway,
        ],
      ),
    );
  }
}
