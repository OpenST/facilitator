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

import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import Mosaic from 'Mosaic';
import { ProofGenerator } from '@openst/mosaic-proof';
import { ERC20Gateway } from 'Mosaic/dist/interacts/ERC20Gateway';
import { ERC20Cogateway } from 'Mosaic/dist/interacts/ERC20Cogateway';
import { TransactionObject } from 'web3/eth/types';
import Observer from '../../common/observer/Observer';
import Logger from '../../common/Logger';
import Anchor from '../models/Anchor';
import MessageRepository from '../repositories/MessageRepository';
import { MessageType } from '../models/Message';
import GatewayRepository from '../repositories/GatewayRepository';
import Gateway from '../models/Gateway';
import TransactionExecutor from '../lib/TransactionExecutor';

import assert = require('assert');

/**
 * Prove gateway service, it reacts on change in anchor entity.
 */
export default class ProveGatewayService extends Observer<Anchor> {
  /** Instance of gateway repository. */
  private gatewayRepository: GatewayRepository;

  /** Instance of message repository. */
  private messageRepository: MessageRepository;

  /** Origin web3 instance. */
  private originWeb3: Web3;

  /** Auxiliary web3 instance. */
  private auxiliaryWeb3: Web3;

  /** Instance of origin transaction executor. */
  private originTransactionExecutor: TransactionExecutor;

  /** Instance of auxiliary transaction executor. */
  private auxiliaryTransactionExecutor: TransactionExecutor;

  /**
   * Construct proveGatewayTransaction gateway service with params
   *
   * @param gatewayRepository Instance of gateway repository.
   * @param messageRepository Instance of message repository.
   * @param originWeb3 Origin web3 instance.
   * @param auxiliaryWeb3 Auxiliary web3 instance.
   * @param originTransactionExecutor Instance of origin transaction executor.
   * @param auxiliaryTransactionExecutor Instance of auxiliary transaction executor.
   */
  public constructor(
    gatewayRepository: GatewayRepository,
    messageRepository: MessageRepository,
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    originTransactionExecutor: TransactionExecutor,
    auxiliaryTransactionExecutor: TransactionExecutor,
  ) {
    super();

    this.gatewayRepository = gatewayRepository;
    this.messageRepository = messageRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;

    this.originTransactionExecutor = originTransactionExecutor;
    this.auxiliaryTransactionExecutor = auxiliaryTransactionExecutor;
  }

  /**
   * This method triggers on update in anchor entity. This method check if there
   * are confirmation pending messages for the gateway associated with given
   * address, then it sends prove gateway transaction.
   *
   * @param anchors List of anchor entities.
   */
  public async update(anchors: Anchor[]): Promise<void> {
    // It can receive max 2 records i.e. origin and auxiliary.
    assert(anchors.length === 1 || anchors.length === 2);

    const proveGatewayPromises = anchors.map(async (anchor): Promise<void> => {
      const gatewayRecord = await this.gatewayRepository.getByAnchor(anchor.anchorGA);
      if (gatewayRecord === null) {
        throw new Error('Gateway record does not exist for given gateway');
      }

      const pendingMessages = await this.messageRepository.getMessagesForConfirmation(
        gatewayRecord.gatewayGA,
        anchor.lastAnchoredBlockNumber,
      );

      Logger.info(`Total pending message ${pendingMessages.length}`);
      if (pendingMessages.length > 0) {
        await this.proveGateway(
          anchor.lastAnchoredBlockNumber,
          pendingMessages[0].type,
          gatewayRecord,
        );
      }
      if (pendingMessages.length === 0) {
        Logger.info(
          `There are no pending messages for gateway ${gatewayRecord.gatewayGA}.`
          + ' Hence skipping proveGateway',
        );
      }
    });

    await Promise.all(proveGatewayPromises);
  }

  /**
   * This method creates and sends prove gateway transaction.
   *
   * @param blockHeight Block height at which anchoring happens.
   * @param pendingMessageType Message type of pending message.
   * @param gateway Gateway record associated with the anchor.
   */
  private async proveGateway(
    blockHeight: BigNumber,
    pendingMessageType: MessageType,
    gateway: Gateway,
  ): Promise<void> {
    let sourceWeb3;
    let targetWeb3;
    let transactionExecutor;

    console.log('pendingMessageType  ', pendingMessageType);
    if (pendingMessageType === MessageType.Deposit) {
      sourceWeb3 = this.originWeb3;
      targetWeb3 = this.auxiliaryWeb3;
      transactionExecutor = this.auxiliaryTransactionExecutor;
    } else {
      sourceWeb3 = this.auxiliaryWeb3;
      targetWeb3 = this.originWeb3;
      transactionExecutor = this.originTransactionExecutor;
    }

    const targetGatewayInstance = Mosaic.interacts.getERC20Cogateway(
      targetWeb3,
      gateway.remoteGA,
    );
    const sourceGatewayAddress = gateway.gatewayGA;

    const rawTransaction = await ProveGatewayService.proveGatewayTransaction(
      sourceWeb3,
      targetGatewayInstance,
      sourceGatewayAddress,
      blockHeight,
    );

    await transactionExecutor.add(rawTransaction);
  }

  /**
   * This method creates prove gateway transaction.
   *
   * @param sourceWeb3 Instance of source web3 from account proof will be
   *                   generated.
   * @param targetGatewayInstance Instance of target web3 where prove gateway
   *                              transaction will be done.
   * @param sourceGatewayAddress Gateway address whose account proof will be
   *                             generated.
   * @param blockNumber Block number at which account proof will be generated.
   */
  private static async proveGatewayTransaction(
    sourceWeb3: Web3,
    targetGatewayInstance: ERC20Gateway | ERC20Cogateway,
    sourceGatewayAddress: string,
    blockNumber: BigNumber,
  ): Promise<TransactionObject<string>> {
    const proofGenerator = new ProofGenerator(sourceWeb3);
    Logger.info(`Generating proof for gateway address ${sourceGatewayAddress} at blockHeight ${blockNumber.toString()}`);
    const proof = await proofGenerator.getOutboxProof(
      sourceGatewayAddress,
      [],
      blockNumber.toString(10),
    );

    return targetGatewayInstance.methods.proveGateway(
      blockNumber.toString(10),
      // @ts-ignore
      proof.encodedAccountValue,
      proof.serializedAccountProof,
    );
  }
}
