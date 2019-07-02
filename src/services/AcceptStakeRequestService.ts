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

import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import Repositories from '../repositories/Repositories';
import StakeRequest from '../models/StakeRequest';
import Observer from '../observer/Observer';
import {
  MessageType, MessageStatus, MessageDirection, MessageRepository, MessageAttributes,
} from '../repositories/MessageRepository';
import assert = require('assert');
import crypto = require('crypto');

const hash = crypto.createHash('sha256');

/**
 * Class collects all non accepted stake requests on a trigger and accepts
 * those stake requests in parallel.
 */
export default class AcceptStakeRequestService extends Observer<StakeRequest> {
  /* Storage */

  private web3: Web3;

  private messageRepository: MessageRepository;


  /* Public Functions */

  public constructor(db: Repositories, web3: Web3) {
    super();

    this.web3 = web3;
    this.messageRepository = db.messageRepository;
  }

  public async update(stakeRequests: StakeRequest[]): Promise<void> {

    const nonAcceptedStakeRequests = stakeRequests.filter(
      (stakeRequest: StakeRequest): boolean => stakeRequest.messageHash === null
    );

    await this.acceptStakeRequests(nonAcceptedStakeRequests);
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

    await this.createMessageInRepository(stakeRequest, secret, hashLock);

    // await this.sendAcceptStakeRequestTransaction(stakeRequest, hashLock);
  }

  // private async sendAcceptStakeRequestTransaction(
  //   stakeRequest: StakeRequest, hashLock: string,
  // ): Promise<void>;

  private async createMessageInRepository(
    stakeRequest: StakeRequest, secret: string, hashLock: string,
  ): Promise<void> {
    const messageHash = this.calculateMessageHash(stakeRequest, hashLock);

    assert(stakeRequest.gateway !== undefined);
    assert(stakeRequest.gasPrice !== undefined);
    assert(stakeRequest.gasLimit !== undefined);
    assert(stakeRequest.nonce !== undefined);
    assert(stakeRequest.stakerProxy !== undefined);

    const messageAttributes: MessageAttributes = {
      messageHash,
      type: MessageType.Stake,
      gatewayAddress: stakeRequest.gateway as string,
      sourceStatus: MessageStatus.Undeclared,
      targetStatus: MessageStatus.Undeclared,
      gasPrice: stakeRequest.gasPrice as BigNumber,
      gasLimit: stakeRequest.gasLimit as BigNumber,
      nonce: stakeRequest.nonce as BigNumber,
      sender: stakeRequest.stakerProxy as string,
      direction: MessageDirection.OriginToAuxiliary,
      sourceDeclarationBlockHeight: new BigNumber(await this.web3.eth.getBlockNumber()),
      secret,
      hashLock,
    };

    await this.messageRepository.create(messageAttributes);
  }

  private static generateSecret(): {secret: string; hashLock: string} {
    const secret: string = crypto.randomBytes(256).toString('hex');
    hash.update(secret);
    const hashLock: string = hash.digest('hex');

    return {
      secret,
      hashLock,
    };
  }

  private calculateMessageHash(stakeRequest: StakeRequest, hashLock: string): string {
    assert(stakeRequest.amount !== undefined);
    assert(stakeRequest.beneficiary !== undefined);
    assert(stakeRequest.gateway !== undefined);

    const stakeIntentHash: string = this.calculateStakeIntentHash(
      stakeRequest.amount as BigNumber,
      stakeRequest.beneficiary as string,
      stakeRequest.gateway as string,
    );

    const messageTypeHash = this.web3.utils.keccak256(
      'Message(bytes32 intentHash,uint256 nonce,uint256 gasPrice,uint256 gasLimit,address sender,bytes32 hashLock)',
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
          stakeRequest.nonce,
          stakeRequest.gasPrice,
          stakeRequest.gasLimit,
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
          amount,
          beneficiary,
          gateway,
        ],
      ),
    );
  }
}
