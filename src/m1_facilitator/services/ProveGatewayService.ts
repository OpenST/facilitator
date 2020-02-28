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

// eslint-disable-next-line import/no-duplicates

import assert from 'assert';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import Mosaic from 'Mosaic';
import { ProofGenerator } from '@openst/mosaic-proof';
import { ERC20Gateway } from 'Mosaic/dist/interacts/ERC20Gateway';
import { ERC20Cogateway } from 'Mosaic/dist/interacts/ERC20Cogateway';
import Observer from '../../common/observer/Observer';
import Logger from '../../common/Logger';
import Anchor from '../models/Anchor';
import MessageRepository from '../repositories/MessageRepository';
import { MessageType } from '../models/Message';
import GatewayRepository from '../repositories/GatewayRepository';
import Utils from '../../m0_facilitator/Utils';

export default class ProveGatewayService extends Observer<Anchor> {
  private gatewayRepository: GatewayRepository;

  private messageRepository: MessageRepository;

  private originWeb3: Web3;

  private auxiliaryWeb3: Web3;

  public constructor(
    gatewayRepository: GatewayRepository,
    messageRepository: MessageRepository,
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
  ) {
    super();

    this.gatewayRepository = gatewayRepository;
    this.messageRepository = messageRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
  }


  public async update(anchors: Anchor[]): Promise<void> {
    assert(anchors.length === 1);
    const anchor = anchors[0];
    await this.proveGateway(
      anchor.lastAnchoredBlockNumber,
      anchor.anchorGA,
    );
  }

  private async proveGateway(
    blockHeight: BigNumber,
    anchorGA: string,
  ): Promise<void> {
    const gatewayRecord = await this.gatewayRepository.getByAnchor(anchorGA);
    if (gatewayRecord === null) {
      throw new Error('Gateway record does not exist for given gateway');
    }

    const pendingMessages = await this.messageRepository.getMessagesForConfirmation(
      gatewayRecord.gatewayGA,
      blockHeight,
    );

    Logger.debug(`Total pending message ${pendingMessages.length}`);
    if (pendingMessages.length === 0) {
      Logger.info(
        `There are no pending messages for gateway ${gatewayRecord.gatewayGA}.`
        + ' Hence skipping proveGateway',
      );
    }

    const messageType = pendingMessages[0].type;
    let sourceWeb3;
    let targetWeb3;
    let targetGatewayInstance;
    let sourceGatewayAddress;

    if (messageType === MessageType.Deposit) {
      sourceWeb3 = this.originWeb3;
      targetWeb3 = this.auxiliaryWeb3;
      targetGatewayInstance = Mosaic.interacts.getERC20Cogateway(
        targetWeb3,
        gatewayRecord.remoteGA,
      );
      sourceGatewayAddress = gatewayRecord.gatewayGA;
    } else {
      sourceWeb3 = this.auxiliaryWeb3;
      targetWeb3 = this.originWeb3;
      targetGatewayInstance = Mosaic.interacts.getERC20Gateway(
        targetWeb3,
        gatewayRecord.remoteGA,
      );
      sourceGatewayAddress = gatewayRecord.remoteGA;
    }

    const transactionHash = ProveGatewayService.prove(
      sourceWeb3,
      targetWeb3,
      targetGatewayInstance,
      sourceGatewayAddress,
      blockHeight,
    );

    Logger.info(`Prove gateway transaction hash ${transactionHash}`);
  }

  private static async prove(
    sourceWeb3: Web3,
    targetWeb3: Web3,
    targetGatewayInstance: ERC20Gateway | ERC20Cogateway,
    sourceGatewayAddress: string,
    blockNumber: BigNumber,
  ): Promise<string> {
    const proofGenerator = new ProofGenerator(sourceWeb3);
    Logger.info(`Generating proof for gateway address ${sourceGatewayAddress} at blockHeight ${blockNumber.toString()}`);
    const proof = await proofGenerator.getOutboxProof(
      sourceGatewayAddress,
      [],
      blockNumber.toString(10),
    );

    // mock
    const rawTx = targetGatewayInstance.methods.proveGateway(
      blockNumber.toString(10),
      proof.accountProof as any,
      proof.storageProof as any,
    );

    const AUXILIARY_GAS_PRICE = '0x3B9ACA00';
    const transactioOptions = {
      from: sourceGatewayAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };

    // mock
    return Utils.sendTransaction(
      rawTx,
      transactioOptions,
      targetWeb3,
    );
  }
}
