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
import Gateway from '../models/Gateway';
import Logger from '../../common/Logger';
import Utils from '../../common/Utils';

/** Represents record of DeclaredWithdrawIntentsEntity. */
interface DeclaredWithdrawIntentsEntityInterface {
  messageHash: string;
  contractAddress: string;
  utilityToken: string;
  amount: string;
  beneficiary: string;
  feeGasPrice: string;
  feeGasLimit: string;
  withdrawer: string;
  blockNumber: string;
  nonce: string;
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
  private supportedTokens: Set<string>;

  /**
   * Construct DeclaredWithdrawIntentsHandler with params.
   *
   * @param withdrawIntentRepository Instance of withdraw intent repository.
   * @param messageRepository Instance of message repository.
   * @param gatewayRepository Instance of gateway repository.
   * @param erc20GatewayTokenPairRepository Instance of ERC20TokenPair repository.
   * @param supportedTokens Value tokens to be facilitated.
   */
  public constructor(
    withdrawIntentRepository: WithdrawIntentRepository,
    messageRepository: MessageRepository,
    gatewayRepository: GatewayRepository,
    erc20GatewayTokenPairRepository: ERC20GatewayTokenPairRepository,
    supportedTokens: Set<string>,
  ) {
    super();

    this.gatewayRepository = gatewayRepository;
    this.withdrawIntentRepository = withdrawIntentRepository;
    this.messageRepository = messageRepository;
    this.erc20GatewayTokenPairRepository = erc20GatewayTokenPairRepository;
    this.supportedTokens = supportedTokens;
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
    Logger.info(`DeclaredWithdrawIntentsHandler::records received ${records.length}`);
    const supportedTokenRecords = await this.getSupportedTokenRecords(records);
    const savePromises = supportedTokenRecords.map(async (record): Promise<void> => {
      const { messageHash, contractAddress } = record;

      Logger.debug(`Received withdraw intent record for messageHash ${messageHash}`);
      const gatewayRecord = await this.gatewayRepository.get(
        Gateway.getGlobalAddress(contractAddress),
      );
      if (gatewayRecord !== null) {
        Logger.info(`DeclaredWithdrawIntentsHandler::gateway record found for gatewayGA ${gatewayRecord.gatewayGA}`);
        await this.handleMessage(
          messageHash,
          Utils.toChecksumAddress(contractAddress),
          new BigNumber(record.feeGasPrice),
          new BigNumber(record.feeGasLimit),
          Utils.toChecksumAddress(record.withdrawer),
          new BigNumber(record.blockNumber),
          new BigNumber(record.nonce),
        );
        await this.handleWithdrawIntent(
          messageHash,
          Utils.toChecksumAddress(record.utilityToken),
          new BigNumber(record.amount),
          Utils.toChecksumAddress(record.beneficiary),
        );
      }
    });
    await Promise.all(savePromises);
    Logger.info('DeclaredWithdrawIntentsHandler::messages saved');
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
    Logger.debug(`DeclaredWithdrawIntentsHandler::Getting withdraw intent record for messageHash ${messageHash}`);
    let withdrawIntentRecord = await this.withdrawIntentRepository.get(messageHash);
    if (withdrawIntentRecord === null) {
      Logger.debug(`DeclaredWithdrawIntentsHandler::Withdraw intent record doesn't exists for mesasgehash: ${messageHash}`);
      withdrawIntentRecord = new WithdrawIntent(
        messageHash,
        utilityTokenAddress,
        amount,
        beneficiary,
      );
    }
    await this.withdrawIntentRepository.save(withdrawIntentRecord);
    Logger.info(`DeclaredWithdrawIntentsHandler:: saved withdrawIntentRecord having messageHash ${withdrawIntentRecord.messageHash}`);
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
   * @param nonce Message nonce.
   */
  private async handleMessage(
    messageHash: string,
    contractAddress: string,
    feeGasPrice: BigNumber,
    feeGasLimit: BigNumber,
    sender: string,
    sourceDeclarationBlockNumber: BigNumber,
    nonce: BigNumber,
  ): Promise<void> {
    Logger.debug(`DeclaredWithdrawIntentsHandler::Getting message record for messageHash ${messageHash}`);
    let message = await this.messageRepository.get(messageHash);

    if (message === null) {
      Logger.debug(`DeclaredWithdrawIntentsHandler::Message record does not exists for messageHash ${messageHash}`);
      message = new Message(
        messageHash,
        MessageType.Withdraw,
        MessageStatus.Undeclared,
        MessageStatus.Undeclared,
        contractAddress,
      );
      message.feeGasPrice = feeGasPrice;
      message.feeGasLimit = feeGasLimit;
      message.sender = Utils.toChecksumAddress(sender);
      message.sourceDeclarationBlockNumber = sourceDeclarationBlockNumber;
      message.nonce = nonce;
    }
    message.sourceStatus = MessageStatus.Declared;
    await this.messageRepository.save(message);
    Logger.info(`DeclaredWithdrawIntentsHandler::saved message having messageHash: ${message.messageHash}`);
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
      const isTokenSupported = await this.isTokenSupported(
        record.contractAddress,
        record.utilityToken,
      );
      if (isTokenSupported) {
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
  private async isTokenSupported(
    coGatewayAddress: string,
    utilityTokenAddress: string,
  ): Promise<boolean> {
    if (this.supportedTokens.size === 0) {
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
      if (this.supportedTokens.has(erc20GatewayTokenPair.valueToken)) {
        return true;
      }
    }
    return false;
  }
}
