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

import assert from 'assert';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import * as Web3Utils from 'web3-utils';

import Message from '../models/Message';
import StakeRequest from '../models/StakeRequest';
import Observer from '../observer/Observer';
import {
  MessageDirection, MessageRepository, MessageStatus, MessageType,
} from '../repositories/MessageRepository';
import Repositories from '../repositories/Repositories';
import StakeRequestRepository from '../repositories/StakeRequestRepository';

/**
 * Class collects all non accepted stake requests on a trigger and accepts
 * those stake requests in parallel.
 */
export default class AcceptStakeRequestService extends Observer<StakeRequest> {
  /* Storage */

  private web3: Web3;

  private stakeRequestRepository: StakeRequestRepository;

  private messageRepository: MessageRepository;


  /* Public Functions */

  public constructor(repos: Repositories, web3: Web3) {
    super();

    this.web3 = web3;
    this.stakeRequestRepository = repos.stakeRequestRepository;
    this.messageRepository = repos.messageRepository;
  }

  public async update(stakeRequests: StakeRequest[]): Promise<void> {
    const nonAcceptedStakeRequests = stakeRequests.filter(
      (stakeRequest: StakeRequest): boolean => !stakeRequest.messageHash,
    );

    await this.acceptStakeRequests(nonAcceptedStakeRequests);
  }

  public static generateSecret(): {secret: string; hashLock: string} {
    const secret = Web3Utils.randomHex(32);
    const hashLock = Web3Utils.keccak256(secret);

    return {
      secret,
      hashLock,
    };
  }


  /* Private Functions */

  private async acceptStakeRequests(stakeRequests: StakeRequest[]): Promise<void> {
    const stakeRequestPromises = [];
    for (let i = 0; i < stakeRequests.length; i += 1) {
      stakeRequestPromises.push(this.acceptStakeRequest(stakeRequests[i]));
    }

    await Promise.all(stakeRequestPromises);
  }

  private async acceptStakeRequest(stakeRequest: StakeRequest): Promise<void> {
    const { secret, hashLock } = AcceptStakeRequestService.generateSecret();

    // const transactionHash = await this.sendAcceptStakeRequestTransaction(
    //   stakeRequest, hashLock,
    // );

    const messageHash = await this.createMessageInRepository(
      stakeRequest, secret, hashLock,
    );

    await this.updateMessageHashInStakeRequestRepository(
      stakeRequest.stakeRequestHash,
      messageHash,
    );
  }

  // private async sendAcceptStakeRequestTransaction(
  //   stakeRequest: StakeRequest, hashLock: string,
  // ): Promise<string> {
  // }

  private async createMessageInRepository(
    stakeRequest: StakeRequest,
    secret: string,
    hashLock: string,
  ): Promise<string> {
    const messageHash = this.calculateMessageHash(stakeRequest, hashLock);

    assert(stakeRequest.gateway !== undefined);
    assert(stakeRequest.gasPrice !== undefined);
    assert(stakeRequest.gasLimit !== undefined);
    assert(stakeRequest.nonce !== undefined);
    assert(stakeRequest.stakerProxy !== undefined);

    const message = new Message(
      messageHash,
      MessageType.Stake,
      stakeRequest.gateway as string,
      MessageStatus.Undeclared,
      MessageStatus.Undeclared,
      stakeRequest.gasPrice as BigNumber,
      stakeRequest.gasLimit as BigNumber,
      stakeRequest.nonce as BigNumber,
      stakeRequest.stakerProxy as string,
      MessageDirection.OriginToAuxiliary,
      new BigNumber(0),
      secret,
      hashLock,
    );

    await this.messageRepository.save(message);

    return messageHash;
  }

  /**
   * Updates the message hash in stake requests' repository after
   * accepting stake request. Accepting stake requests adds a new entry
   * into messages' repository with a message hash. That exact message
   * hash is updated here in stake requests' repository.
   */
  private async updateMessageHashInStakeRequestRepository(
    stakeRequestHash: string,
    messageHash: string,
  ): Promise<void> {
    const stakeRequest = new StakeRequest(
      stakeRequestHash,
    );
    stakeRequest.messageHash = messageHash;

    await this.stakeRequestRepository.save(stakeRequest);
  }

  private calculateMessageHash(stakeRequest: StakeRequest, hashLock: string): string {
    assert(stakeRequest.amount !== undefined);
    assert(stakeRequest.beneficiary !== undefined);
    assert(stakeRequest.gateway !== undefined);
    assert(stakeRequest.nonce !== undefined);
    assert(stakeRequest.gasPrice !== undefined);
    assert(stakeRequest.gasLimit !== undefined);

    const stakeIntentHash: string = this.calculateStakeIntentHash(
      stakeRequest.amount as BigNumber,
      stakeRequest.beneficiary as string,
      stakeRequest.gateway as string,
    );

    const messageTypeHash = this.web3.utils.keccak256(
      'Message(bytes32 intentHash,uint256 nonce,uint256 gasPrice,'
      + 'uint256 gasLimit,address sender,bytes32 hashLock)',
    );

    return this.web3.utils.keccak256(
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
          (stakeRequest.nonce as BigNumber).toFixed(),
          (stakeRequest.gasPrice as BigNumber).toFixed(),
          (stakeRequest.gasLimit as BigNumber).toFixed(),
          stakeRequest.stakerProxy,
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
    const stakeIntentTypeHash = this.web3.utils.keccak256(
      'StakeIntent(uint256 amount,address beneficiary,address gateway)',
    );

    return this.web3.utils.keccak256(
      this.web3.eth.abi.encodeParameters(
        [
          'bytes32',
          'uint256',
          'address',
          'address',
        ],
        [
          stakeIntentTypeHash,
          amount.toFixed(),
          beneficiary,
          gateway,
        ],
      ),
    );
  }
}
