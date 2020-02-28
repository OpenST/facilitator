// Copyright 2020 OpenST Ltd.
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
import Observer from '../../common/observer/Observer';
import Logger from '../../common/Logger';
import Anchor from '../models/Anchor';
import MessageRepository from '../repositories/MessageRepository';
import GatewayRepository from '../repositories/GatewayRepository';
import DepositIntentRepository from '../repositories/DepositIntentRepository';

export default class ProveGatewayService extends Observer<Anchor> {
  private gatewayRepository: GatewayRepository;

  private messageRepository: MessageRepository;

  private depositIntentRepository: DepositIntentRepository;

  private originWeb3: Web3;

  private auxiliaryWeb3: Web3;

  public constructor(
    gatewayRepository: GatewayRepository,
    messageRepository: MessageRepository,
    depositIntentRepository: DepositIntentRepository,
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
  ) {
    super();

    this.gatewayRepository = gatewayRepository;
    this.messageRepository = messageRepository;
    this.depositIntentRepository = depositIntentRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
  }


  public async update(anchors: Anchor[]): Promise<void> {
    const interestedAnchorRecord = anchors
    .filter((anchor): boolean => anchor.lastAnchoredBlockNumber !== undefined);

    assert(
      interestedAnchorRecord.length <= 1,
      'interestedAnchorRecord length should be less than or equal to 1'
    );

    if(interestedAnchorRecord.length === 1) {
      await this.proveGateway(
        interestedAnchorRecord[0].lastAnchoredBlockNumber!,
        interestedAnchorRecord[0].anchorGA
      );
    }
  }

  private async proveGateway(
    blockHeight: BigNumber,
    anchorGA: string
  ): Promise <{ transactionHash: string; message: string}> {
    const gatewayRecord = await this.gatewayRepository.getByAnchor(anchorGA);
    if (gatewayRecord === null) {
      return Promise.reject(new Error('Gateway record does not exist for given gateway'));
    }

    // const pendingMessages = await this.messageRepository.getMessagesForConfirmation(
    //   gatewayRecord.gatewayGA,
    //   blockHeight
    // );
  }
}
