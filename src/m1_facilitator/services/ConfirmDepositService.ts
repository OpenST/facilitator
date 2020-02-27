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

import Web3 from 'web3';
import Mosaic from 'Mosaic';

import ProofGenerator from '@openst/mosaic-proof/lib/src/ProofGenerator';
import BigNumber from 'bignumber.js';
import { Error } from 'sequelize';
import MessageRepository from '../repositories/MessageRepository';
import DepositIntentRepository from '../repositories/DepositIntentRepository';
import Observer from '../../common/observer/Observer';
import DepositIntent from '../models/DepositIntent';
import Message, { MessageStatus } from '../models/Message';
import GatewayRepository from '../repositories/GatewayRepository';
import Gateway from '../models/Gateway';

/**
 * This service reacts to updates in ConfirmDeposit entity.
 */
export default class ConfirmDepositService extends Observer<DepositIntent> {
  /** Instance of auxiliary web3. */
  private web3: Web3;

  /** Instance of gateway repository. */
  private gatewayRepository: GatewayRepository;

  /** Instance of message repository. */
  private messageRepository: MessageRepository;

  /** Instance of deposit intent repository. */
  private depositIntentRepository: DepositIntentRepository;

  /**
   *
   * @param web3
   * @param messageRepository
   * @param depositIntentRepository
   * @param gatewayRepository
   */
  public constructor(
    web3: Web3,
    messageRepository: MessageRepository,
    depositIntentRepository: DepositIntentRepository,
    gatewayRepository: GatewayRepository,
  ) {
    super();
    this.gatewayRepository = gatewayRepository;
    this.web3 = web3;
    this.messageRepository = messageRepository;
    this.depositIntentRepository = depositIntentRepository;
  }

  async update(depositIntents: DepositIntent[]) {
    depositIntents.map(async (depositIntent: DepositIntent) => {
      const { messageHash } = depositIntent;
      const messageRecord = await this.messageRepository.get(messageHash);

      if (messageRecord !== null) {
        const gatewayRecord = await this.gatewayRepository.get(
          Gateway.getGlobalAddress(messageRecord.gatewayAddress),
        );

        const shouldConfirmDepositIntent = gatewayRecord
          && ConfirmDepositService.shouldConfirmDepositIntent(
            gatewayRecord,
            messageRecord,
          );
        if (shouldConfirmDepositIntent) {

        }
      }
    });
  }

  private static shouldConfirmDepositIntent(gatewayRecord: Gateway, messageRecord: Message) {
    return messageRecord.sourceDeclarationBlockNumber
      && gatewayRecord.remoteGatewayLastProvenBlockNumber.isGreaterThanOrEqualTo(
        messageRecord.sourceDeclarationBlockNumber,
      )
      && messageRecord.targetStatus === MessageStatus.Undeclared;
  }

  private static confirmDepositIntentTransaction(
    message: Message,
    depositIntent: DepositIntent,
    gateway: Gateway,
    web3: Web3,
    blockNumber: BigNumber,
  ) {
    const cogatewayAddress = gateway.remoteGA;
    const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(web3, cogatewayAddress);

    const proof = await new ProofGenerator(web3).getOutboxProof(
      message.gatewayAddress,
      [message.messageHash],
      blockNumber.toString(10),
    );

    if (proof.storageProof[0].value === '0') {
      return Promise.reject(new Error('Storage proof is invalid'));
    }
    erc20Cogateway.methods.confirmDeposit(
      depositIntent.tokenAddress,
      depositIntent.amount,
      depositIntent.beneficiary,
      message.feeGasPrice,
      message.feeGasLimit,
      message.sender,
      proof.storageProof[0].serializedProof,
      blockNumber,
    );
  }
}
