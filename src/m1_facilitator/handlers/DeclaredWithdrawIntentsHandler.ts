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

import ContractEntityHandler from '../../common/handlers/ContractEntityHandler';

import GatewayRepository from '../repositories/GatewayRepository';
import Message, { MessageStatus, MessageType } from '../models/Message';
import MessageRepository from '../repositories/MessageRepository';
import WithdrawIntent from '../models/WithdrawIntent';
import WithdrawIntentRepository from '../repositories/WithdrawIntentRepository';
import ERC20GatewayTokenPairRepository from '../repositories/ERC20GatewayTokenPairRepository';
import Utils from '../../common/Utils';

/** Represents record of DeclaredWithdrawIntentsEntity. */
interface DeclaredWithdrawIntentsEntityInterface {
  messageHash: string;
  contractAddress: string;
  utilityTokenAddress: string;
  amount: string;
  beneficiary: string;
  feeGasPrice: string;
  feeGasLimit: string;
  withdrawer: string;
  blockNumber: string;
}

/**
 * This class handles the updates from DeclaredWithdrawIntents.
 */
export default class DeclaredWithdrawIntentsHandler extends ContractEntityHandler {
  /* Withdraw intent repository. */
  private withdrawIntentRepository: WithdrawIntentRepository;

  /* Gateway repository instance. */
  private gatewayRepository: GatewayRepository;

  /* Message repository. */
  private messageRepository: MessageRepository;

  /* ERC20GatewayTokenPair repository. */
  private erc20GatewayTokenPairRepository: ERC20GatewayTokenPairRepository;

  /* Unique list of value token addresses to be facilitated. */
  private facilitateTokens: Set<string>;

  /**
   * Construct DeclaredWithdrawIntentsHandler with params.
   *
   * @param withdrawIntentRepository Instance of withdraw intent repository.
   * @param messageRepository Instance of message repository.
   * @param gatewayRepository Instance of gateway repository.
   * @param erc20GatewayTokenPairRepository Instance of ERC20TokenPair repository.
   * @param facilitateTokens Value tokens to be facilitated.
   */
  public constructor(
    withdrawIntentRepository: WithdrawIntentRepository,
    messageRepository: MessageRepository,
    gatewayRepository: GatewayRepository,
    erc20GatewayTokenPairRepository: ERC20GatewayTokenPairRepository,
    facilitateTokens: Set<string>,
  ) {
    super();

    this.gatewayRepository = gatewayRepository;
    this.withdrawIntentRepository = withdrawIntentRepository;
    this.messageRepository = messageRepository;
    this.erc20GatewayTokenPairRepository = erc20GatewayTokenPairRepository;
    this.facilitateTokens = facilitateTokens;
  }

  /**
   * Handles DeclaredWithdrawIntents entity records.
   * - Filters non supported tokens.
   * - It creates a message record and updates it's source status to `Declared`.
   * - It creates `WithdrawIntent` record.
   * - This handler only reacts to the events of cogateways which are populated
   *   during seed data. It silently ignores the events by other cogateways.
   *
   * @param records List of declared withdraw intents.
   */
  public async handle(records: DeclaredWithdrawIntentsEntityInterface[]): Promise<void> {
    const supportedTokenRecords = await this.getSupportedTokenRecords(records);
    const savePromises = supportedTokenRecords.map(async (record): Promise<void> => {
      const { messageHash, contractAddress } = record;
      const gatewayRecord = await this.gatewayRepository.get(contractAddress);

      if (gatewayRecord !== null) {
        await this.handleMessage(
          messageHash,
          Utils.toChecksumAddress(contractAddress),
          new BigNumber(record.feeGasPrice),
          new BigNumber(record.feeGasLimit),
          Utils.toChecksumAddress(record.withdrawer),
          new BigNumber(record.blockNumber),
        );
        await this.handleWithdrawIntent(
          messageHash,
          Utils.toChecksumAddress(record.utilityTokenAddress),
          new BigNumber(record.amount),
          Utils.toChecksumAddress(record.beneficiary),
        );
      }
    });
    await Promise.all(savePromises);
  }

  /**
   * Handles updates of withdraw intent model.
   *
   * @param messageHash Message hash.
   * @param utilityTokenAddress Address of utility token contract.
   * @param amount Amount in atto.
   * @param beneficiary Address of beneficiary.
   */
  private async handleWithdrawIntent(
    messageHash: string,
    utilityTokenAddress: string,
    amount: BigNumber,
    beneficiary: string,
  ): Promise<void> {
    let withdrawIntentRecord = await this.withdrawIntentRepository.get(messageHash);
    if (withdrawIntentRecord === null) {
      withdrawIntentRecord = new WithdrawIntent(
        messageHash,
        utilityTokenAddress,
        amount,
        beneficiary,
      );
    }
    await this.withdrawIntentRepository.save(withdrawIntentRecord);
  }

  /**
   * Handle updates in message model.
   *
   * @param messageHash Message hash.
   * @param contractAddress Cogateway contract address.
   * @param feeGasPrice Message transfer fee gas price.
   * @param feeGasLimit Message transfer fee gas limit.
   * @param sender Address of message sender.
   * @param sourceDeclarationBlockNumber Block number at which this transaction is mined.
   */
  private async handleMessage(
    messageHash: string,
    contractAddress: string,
    feeGasPrice: BigNumber,
    feeGasLimit: BigNumber,
    sender: string,
    sourceDeclarationBlockNumber: BigNumber,
  ): Promise<void> {
    let message = await this.messageRepository.get(messageHash);

    if (message === null) {
      message = new Message(
        messageHash,
        MessageType.Withdraw,
        MessageStatus.Undeclared,
        MessageStatus.Undeclared,
        contractAddress,
      );
      message.feeGasPrice = feeGasPrice;
      message.feeGasLimit = feeGasLimit;
      message.sender = sender;
      message.sourceDeclarationBlockNumber = sourceDeclarationBlockNumber;
    }
    message.sourceStatus = MessageStatus.Declared;
    await this.messageRepository.save(message);
  }

  /**
   * Filters non supported tokens and returns records with suported tokens.
   * @param records List of declared withdraw intents.
   */
  private async getSupportedTokenRecords(
    records: DeclaredWithdrawIntentsEntityInterface[],
  ): Promise<DeclaredWithdrawIntentsEntityInterface[]> {
    const supportedTokenRecords: DeclaredWithdrawIntentsEntityInterface[] = [];
    for (let i = 0; i < records.length; i += 1) {
      const record = records[i];
      // eslint-disable-next-line no-await-in-loop
      const isFacilitateToken = await this.isFacilitateToken(
        record.contractAddress,
        record.utilityTokenAddress,
      );
      if (isFacilitateToken) {
        supportedTokenRecords.push(record);
      }
    }
    return supportedTokenRecords;
  }

  /**
   * Checks if utility token => value token address needs to be facilitated.
   *
   * @param coGatewayAddress Cogateway contract address .
   * @param utilityTokenAddress Value token address.
   */
  private async isFacilitateToken(
    coGatewayAddress: string,
    utilityTokenAddress: string,
  ): Promise<boolean> {
    if (this.facilitateTokens.size === 0) {
      return true;
    }
    const gatewayRecord = await this.gatewayRepository.get(coGatewayAddress);
    if (gatewayRecord) {
      const erc20GatewayTokenPair = await this.erc20GatewayTokenPairRepository.getByUtilityToken(
        gatewayRecord.remoteGA,
        utilityTokenAddress,
      );
      if (!erc20GatewayTokenPair) {
        return false;
      }
      if (this.facilitateTokens.has(erc20GatewayTokenPair.valueToken)) {
        return true;
      }
    }
    return false;
  }
}
