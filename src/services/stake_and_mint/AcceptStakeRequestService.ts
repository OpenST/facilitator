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
import * as Web3Utils from 'web3-utils';

import { interacts } from '@openst/mosaic-contracts';
import { OSTComposer } from '@openst/mosaic-contracts/dist/interacts/OSTComposer';
import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';

import { ORIGIN_GAS_PRICE } from '../../Constants';
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
 * Class collects all non accepted stake requests on a trigger and accepts
 * those stake requests in parallel.
 */
export default class AcceptStakeRequestService extends Observer<MessageTransferRequest> {
  /* Storage */

  private web3: Web3;

  private messageTransferRequestRepository: MessageTransferRequestRepository;

  private messageRepository: MessageRepository;

  private ostComposerAddress: string;

  private originWorkerAddress: string;


  /* Public Functions */

  public constructor(
    repos: Repositories,
    web3: Web3,
    ostComposerAddress: string,
    originWorkerAddress: string,
  ) {
    super();

    this.web3 = web3;
    this.messageTransferRequestRepository = repos.messageTransferRequestRepository;
    this.messageRepository = repos.messageRepository;
    this.ostComposerAddress = ostComposerAddress;
    this.originWorkerAddress = originWorkerAddress;
  }

  public async update(stakeRequests: MessageTransferRequest[]): Promise<void> {
    Logger.debug('Accept stake request service invoked');
    const nonAcceptedStakeRequests = stakeRequests.filter(
      (stakeRequest: MessageTransferRequest): boolean => !stakeRequest.messageHash,
    );

    await this.acceptStakeRequests(nonAcceptedStakeRequests);
  }

  public static generateSecret(): { secret: string; hashLock: string } {
    const secret = Web3Utils.randomHex(32);
    const hashLock = Web3Utils.keccak256(secret);

    return {
      secret,
      hashLock,
    };
  }


  /* Private Functions */

  private async acceptStakeRequests(stakeRequests: MessageTransferRequest[]): Promise<void> {
    const stakeRequestPromises = [];
    for (let i = 0; i < stakeRequests.length; i += 1) {
      stakeRequestPromises.push(
        this.acceptStakeRequest(stakeRequests[i]).catch((error) => {
          Logger.error('acceptStakeRequestServiceError', error);
        }),
      );
    }

    await Promise.all(stakeRequestPromises);
  }

  private async acceptStakeRequest(stakeRequest: MessageTransferRequest): Promise<void> {
    await this.approveForBounty(stakeRequest);
    const { secret, hashLock } = AcceptStakeRequestService.generateSecret();

    const transactionHash = await this.sendAcceptStakeRequestTransaction(
      stakeRequest, hashLock,
    );
    Logger.info(`Accept stake request transaction hash ${transactionHash}`);
    const messageHash = await this.createMessageInRepository(
      stakeRequest, secret, hashLock,
    );

    await this.updateMessageHashInRequestRepository(
      stakeRequest.requestHash,
      messageHash,
      stakeRequest.blockNumber,
    );
  }

  private async approveForBounty(stakeRequest: MessageTransferRequest) {
    const eip20GatewayInteract = interacts.getEIP20Gateway(
      this.web3,
      stakeRequest.gateway,
    );

    const bounty = await eip20GatewayInteract.methods.bounty().call();
    if (new BigNumber(bounty).lessThanOrEqualTo(0)) {
      Logger.debug('Skipping bounty approval for zero bounty');
      return;
    }
    Logger.debug(`Bounty of gateway ${stakeRequest.gateway} is ${bounty}`);
    const baseToken = await eip20GatewayInteract.methods.baseToken().call();

    const baseTokenInteract = interacts.getEIP20Token(this.web3, baseToken);
    Logger.debug(`Sending bounty approval transaction for base token ${baseToken}`);
    const rawTransaction = baseTokenInteract.methods.approve(
      this.ostComposerAddress,
      bounty,
    );

    const txHash = await Utils.sendTransaction(rawTransaction, {
      from: this.originWorkerAddress,
      gasPrice: ORIGIN_GAS_PRICE,
    },
    this.web3);
    Logger.info(`Bounty approval transaction hash ${txHash}`);
  }

  /**
   * This method sends accept stake request transaction.
   * @param stakeRequest Stake request object.
   * @param hashLock Hash lock passed as accept request argument.
   */
  private async sendAcceptStakeRequestTransaction(
    stakeRequest: MessageTransferRequest, hashLock: string,
  ): Promise<string> {
    Logger.debug(`Sending accept request transaction for staker proxy ${stakeRequest.senderProxy}`);
    const ostComposer: OSTComposer = interacts.getOSTComposer(this.web3, this.ostComposerAddress);

    assert(stakeRequest.amount !== undefined);
    assert(stakeRequest.beneficiary !== undefined);
    assert(stakeRequest.gasPrice !== undefined);
    assert(stakeRequest.gasLimit !== undefined);
    assert(stakeRequest.nonce !== undefined);
    assert(stakeRequest.sender !== undefined);
    assert(stakeRequest.gateway !== undefined);

    const rawTx: TransactionObject<string> = ostComposer.methods.acceptStakeRequest(
      (stakeRequest.amount as BigNumber).toString(10),
      (stakeRequest.beneficiary as string),
      (stakeRequest.gasPrice as BigNumber).toString(10),
      (stakeRequest.gasLimit as BigNumber).toString(10),
      (stakeRequest.nonce as BigNumber).toString(10),
      (stakeRequest.sender as string),
      (stakeRequest.gateway as string),
      hashLock,
    );
    return Utils.sendTransaction(rawTx, {
      from: this.originWorkerAddress,
      gasPrice: ORIGIN_GAS_PRICE,
    }, this.web3);
  }

  private async createMessageInRepository(
    stakeRequest: MessageTransferRequest,
    secret: string,
    hashLock: string,
  ): Promise<string> {
    const messageHash = this.calculateMessageHash(stakeRequest, hashLock);
    Logger.debug(`Creating message for message hash ${messageHash}`);
    assert(stakeRequest.gateway !== undefined);
    assert(stakeRequest.gasPrice !== undefined);
    assert(stakeRequest.gasLimit !== undefined);
    assert(stakeRequest.nonce !== undefined);
    assert(stakeRequest.senderProxy !== undefined);

    const message = new Message(
      messageHash,
      MessageType.Stake,
      stakeRequest.gateway as string,
      MessageStatus.Undeclared,
      MessageStatus.Undeclared,
      stakeRequest.gasPrice as BigNumber,
      stakeRequest.gasLimit as BigNumber,
      stakeRequest.nonce as BigNumber,
      stakeRequest.senderProxy as string,
      MessageDirection.OriginToAuxiliary,
      new BigNumber(0),
      secret,
      hashLock,
    );

    await this.messageRepository.save(message);
    Logger.debug(`Message object saved for message hash ${message.messageHash}`);
    return messageHash;
  }

  /**
   * Updates the message hash in requests' repository after
   * accepting stake request. Accepting stake requests adds a new entry
   * into messages' repository with a message hash. That exact message
   * hash is updated here in requests' repository.
   */
  private async updateMessageHashInRequestRepository(
    stakeRequestHash: string,
    messageHash: string,
    blockNumber: BigNumber,
  ): Promise<void> {
    const stakeRequest = new MessageTransferRequest(
      stakeRequestHash,
      RequestType.Stake,
      blockNumber,
    );
    stakeRequest.messageHash = messageHash;
    Logger.debug('Updating message hash in message transfer request repository');
    await this.messageTransferRequestRepository.save(stakeRequest);
  }

  private calculateMessageHash(stakeRequest: MessageTransferRequest, hashLock: string): string {
    assert(stakeRequest.amount !== undefined);
    assert(stakeRequest.beneficiary);
    assert(stakeRequest.gateway);
    assert(stakeRequest.nonce !== undefined);
    assert(stakeRequest.gasPrice !== undefined);
    assert(stakeRequest.gasLimit !== undefined);
    assert(stakeRequest.senderProxy);

    const stakeIntentHash: string = this.calculateStakeIntentHash(
      stakeRequest.amount as BigNumber,
      stakeRequest.beneficiary as string,
      stakeRequest.gateway as string,
    );

    const messageTypeHash = this.web3.utils.sha3(
      this.web3.eth.abi.encodeParameter(
        'string',
        'Message(bytes32 intentHash,uint256 nonce,uint256 gasPrice,'
        + 'uint256 gasLimit,address sender,bytes32 hashLock)',
      ),
    );

    return this.web3.utils.sha3(
      this.web3.eth.abi.encodeParameters(
        [
          'bytes32',
          'bytes32',
          'uint256',
          'uint256',
          'uint256',
          'address',
          'bytes32',
        ],
        [
          messageTypeHash,
          stakeIntentHash,
          (stakeRequest.nonce as BigNumber).toString(10),
          (stakeRequest.gasPrice as BigNumber).toString(10),
          (stakeRequest.gasLimit as BigNumber).toString(10),
          stakeRequest.senderProxy,
          hashLock,
        ],
      ),
    );
  }

  private calculateStakeIntentHash(
    amount: BigNumber,
    beneficiary: string,
    gateway: string,
  ): string {
    const stakeIntentTypeHash = this.web3.utils.sha3(
      this.web3.eth.abi.encodeParameter(
        'string',
        'StakeIntent(uint256 amount,address beneficiary,address gateway)',
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
          stakeIntentTypeHash,
          amount.toString(10),
          beneficiary,
          gateway,
        ],
      ),
    );
  }
}
