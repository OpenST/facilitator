import assert from 'assert';
import Web3 from 'web3';

import { interacts } from '@openst/mosaic-contracts';

import { AUXILIARY_GAS_PRICE, ORIGIN_GAS_PRICE } from '../Constants';
import Logger from '../Logger';
import Gateway from '../models/Gateway';
import Message from '../models/Message';
import GatewayRepository from '../repositories/GatewayRepository';
import { MessageStatus } from '../repositories/MessageRepository';
import Utils from '../Utils';

/**
 * It facilitates progress staking and minting.
 */
export default class ProgressService {
  private originWeb3: Web3;

  private auxiliaryWeb3: Web3;

  private gatewayAddress: string;

  private originWorkerAddress: string;

  private auxWorkerAddress: string;

  private gatewayRepository: GatewayRepository;

  /**
   * @param gatewayRepository Instance of GatewayRepository.
   * @param originWeb3 Origin chain web3 object.
   * @param auxiliaryWeb3 Auxiliary chain web3 object.
   * @param gatewayAddress Address of gateway contract.
   * @param originWorkerAddress Origin chain worker address.
   * @param auxWorkerAddress Auxiliary chain worker address.
   */
  public constructor(
    gatewayRepository: GatewayRepository,
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    gatewayAddress: string,
    originWorkerAddress: string,
    auxWorkerAddress: string,
  ) {
    this.gatewayRepository = gatewayRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.gatewayAddress = gatewayAddress;
    this.originWorkerAddress = originWorkerAddress;
    this.auxWorkerAddress = auxWorkerAddress;
  }

  /**
   * This method react on changes in Message model.
   * @param messages List of Message models.
   */
  public async update(messages: Message[]): Promise<void> {
    Logger.debug('Progress service invoked');

    const progressPromises = messages
      .filter(message => message.isValidSecret())
      .map(async (message) => {
        Logger.debug(`Progressing message hash ${message.messageHash}`);
        if (message.sourceStatus === MessageStatus.Declared
        && message.targetStatus === MessageStatus.Declared
        ) {
          Logger.debug(`Performing progress stake and progress mint for message hash ${message.messageHash}`);
          const progressStakePromise = this.progressStake(message).catch( (error) => {
            Logger.error('progressStakeError', error);
          });
          const progressMintPromise = this.progressMint(message).catch( (error) => {
            Logger.error('progressMintError', error);
          });
          return Promise.all([progressStakePromise, progressMintPromise]);
        }
        return Promise.resolve();
      });

    await Promise.all(progressPromises);
  }

  /**
   * This is a private method which uses mosaic-contracts to make progressStake transaction.
   * @param message Message model object.
   * @returns Promise which resolves to transaction hash.
   */
  private async progressStake(message: Message): Promise<string> {
    Logger.debug(`Sending progress stake transaction for message ${message.messageHash}`);
    const eip20Gateway = interacts.getEIP20Gateway(
      this.originWeb3,
      this.gatewayAddress,
    );
    const transactionOptions = {
      from: this.originWorkerAddress,
      gasPrice: ORIGIN_GAS_PRICE,
    };

    assert(message.secret !== undefined, 'message secret is undefined');

    const rawTx = eip20Gateway.methods.progressStake(
      message.messageHash,
      message.secret!,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
      this.originWeb3,
    ).then((txHash) => {
      Logger.debug(`Progress stake transaction hash ${txHash} for message ${message.messageHash}`);
      return txHash;
    });
  }

  /**
   * This is a private method which uses mosaic-contracts to make progressMint transaction.
   * @param message Message model object.
   * @returns Promise which resolves to transaction hash.
   */
  private async progressMint(message: Message): Promise<string> {
    Logger.debug(`Sending progress mint transaction for message ${message.messageHash}`);

    assert(message.gatewayAddress !== undefined);

    const gatewayRecord = await this.gatewayRepository.get(message.gatewayAddress as string);

    assert(
      gatewayRecord !== null,
      `Gateway record not found for gateway: ${message.gatewayAddress}`,
    );

    const eip20CoGateway = interacts.getEIP20CoGateway(
      this.auxiliaryWeb3,
      (gatewayRecord as Gateway).remoteGatewayAddress,
    );

    const transactionOptions = {
      from: this.auxWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };

    const rawTx = eip20CoGateway.methods.progressMint(
      message.messageHash,
      message.secret!,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
      this.auxiliaryWeb3,
    ).then((txHash) => {
      Logger.debug(`Progress mint transaction hash ${txHash} for message ${message.messageHash}`);
      return txHash;
    });
  }
}
