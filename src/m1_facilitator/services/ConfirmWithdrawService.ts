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

/* eslint-disable import/no-unresolved */

import assert from 'assert';
import Mosaic from 'Mosaic';
import { ProofGenerator } from '@openst/mosaic-proof';
import Web3 from 'web3';

import ERC20GatewayTokenPairRepository from '../repositories/ERC20GatewayTokenPairRepository';
import Gateway from '../models/Gateway';
import Logger from '../../common/Logger';
import Message from '../models/Message';
import MessageRepository from '../repositories/MessageRepository';
import Observer from '../../common/observer/Observer';
import WithdrawIntentRepository from '../repositories/WithdrawIntentRepository';
import Utils from '../../m0_facilitator/Utils';

/**
 * Class collects all non confirmed pending messages for withdraw and confirms those messages.
 */
export default class ConfirmWithdrawService extends Observer<Gateway> {
  private messageRepository: MessageRepository;

  private withdrawIntentRepository: WithdrawIntentRepository;

  private erc20GatewayTokenPairRepository: ERC20GatewayTokenPairRepository;

  private originWeb3: Web3;

  private auxiliaryWeb3: Web3;

  private gatewayAddress: string;

  /**
   * Constructor of class ConfirmWithdrawService;
   *
   * @param messageRepository Instance of message repository.
   * @param withdrawIntentRepository Instance of withdraw intent repository.
   * @param erc20GatewayTokenPairRepository Instance of ERC20GatewayTokenPairRepository.
   * @param originWeb3 Instance of origin chain web3.
   * @param auxiliaryWeb3 Instance of auxiliary chain web3.
   * @param gatewayAddress Origin chain gateway address.
   */
  public constructor(
    messageRepository: MessageRepository,
    withdrawIntentRepository: WithdrawIntentRepository,
    erc20GatewayTokenPairRepository: ERC20GatewayTokenPairRepository,
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    gatewayAddress: string,
  ) {
    super();
    this.messageRepository = messageRepository;
    this.erc20GatewayTokenPairRepository = erc20GatewayTokenPairRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.gatewayAddress = gatewayAddress;
  }

  public async update(gateway: Gateway[]): Promise<void> {
    Logger.debug('Confirm withdraw service invoked');
    assert(
      gateway.length === 1,
      'There should be only 1 gateway record',
    );
    const provenGateway: Gateway = gateway[0];

    await this.confirmWithdraw(provenGateway);
  }

  /**
   * Collects all ConfirmWithdraw promises and transaction is sent.
   *
   * @param gateway Instance of Gateway model object.
   */
  private async confirmWithdraw(
    gateway: Gateway,
  ): Promise<Record<string, string>> {
    const messages = await this.messageRepository.getMessagesForConfirmation(
      gateway.gatewayGA,
      gateway.remoteGatewayLastProvenBlockNumber,
    );


    const proofGenerator = new ProofGenerator(
      this.auxiliaryWeb3,
    );

    if (messages.length === 0) {
      return {};
    }

    const transactionHashes: Record<string, string> = {};

    const promises = messages
      .filter((message): boolean => message.isWithdrawType())
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
   * Generates outbox proof for a messageHash and sends ConfirmWithdraw transaction.
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
    Logger.debug(`Generating proof for confirm withdraw for ${gateway.remoteGA} and message hash ${message.messageHash}`);
    const messageBoxOffset = await Utils.getMessageBoxOffset(
      this.originWeb3,
      gateway.remoteGA,
    );

    const proofData = await proofGenerator.get(
      gateway.remoteGA,
      [message.messageHash],
      gateway.remoteGatewayLastProvenBlockNumber.toString(10),
      messageBoxOffset,
    );

    if (proofData.storageProof[0].value === '0') {
      return Promise.reject(new Error('Storage Proof is invalid'));
    }


    Logger.debug(`Generated Proof ${JSON.stringify(proofData)}`);
    const erc20Gateway = Mosaic.interacts.getERC20Gateway(
      this.originWeb3,
      this.gatewayAddress,
    );

    const ORIGIN_GAS_PRICE = '0x2540BE400';
    const transactionOptions = {
      from: gateway.remoteGA,
      gasPrice: ORIGIN_GAS_PRICE,
    };

    const messageRecord = await this.messageRepository.get(message.messageHash);
    const withdrawIntentRecord = await this.withdrawIntentRepository.get(
      message.messageHash,
    );

    const amount = withdrawIntentRecord.amount.toString();
    const { beneficiary } = withdrawIntentRecord;
    const feeGasPrice = messageRecord.feeGasPrice.toString();
    const feeGasLimit = messageRecord.feeGasLimit.toString();
    const withdrawer = messageRecord.sender;
    const blockNumber = gateway.remoteGatewayLastProvenBlockNumber.toString();

    const erc20GatewayTokenPairRepository = await this.erc20GatewayTokenPairRepository.get(
      gateway.remoteGA,
      withdrawIntentRecord.tokenAddress,
    );

    const utilitytoken = erc20GatewayTokenPairRepository.utilityToken;
    const { valueToken } = erc20GatewayTokenPairRepository;

    const rawTx = erc20Gateway.methods.confirmWithdraw(
      utilitytoken,
      valueToken,
      beneficiary,
      amount,
      feeGasPrice,
      feeGasLimit,
      withdrawer,
      blockNumber,
      proofData.storageProof[0].proof,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
      this.originWeb3,
    );
  }
}
