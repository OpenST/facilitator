import assert from 'assert';
import Web3 from 'web3';

import { interacts } from '@openst/mosaic-contracts';

import { AUXILIARY_GAS_PRICE, ORIGIN_GAS_PRICE } from '../../Constants';
import Logger from '../../Logger';
import Gateway from '../../models/Gateway';
import Message from '../../models/Message';
import GatewayRepository from '../../repositories/GatewayRepository';
import { MessageStatus, MessageType } from '../../repositories/MessageRepository';
import Utils from '../../Utils';

/**
 * It facilitates progress redeeming and unstaking.
 */
export default class ProgressService {
  private originWeb3: Web3;

  private auxiliaryWeb3: Web3;

  private coGatewayAddress: string;

  private originWorkerAddress: string;

  private auxWorkerAddress: string;

  private gatewayRepository: GatewayRepository;

  /**
   * @param gatewayRepository Instance of GatewayRepository.
   * @param originWeb3 Origin chain web3 object.
   * @param auxiliaryWeb3 Auxiliary chain web3 object.
   * @param coGatewayAddress Address of coGateway contract.
   * @param originWorkerAddress Origin chain worker address.
   * @param auxWorkerAddress Auxiliary chain worker address.
   */
  public constructor(
    gatewayRepository: GatewayRepository,
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    coGatewayAddress: string,
    originWorkerAddress: string,
    auxWorkerAddress: string,
  ) {
    this.gatewayRepository = gatewayRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.coGatewayAddress = coGatewayAddress;
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
      .filter(message => (message.type === MessageType.Redeem) && message.isValidSecret())
      .map(async (message) => {
        Logger.debug(`Progressing message hash ${message.messageHash}`);
        if (message.sourceStatus === MessageStatus.Declared
        && message.targetStatus === MessageStatus.Declared
        ) {
          Logger.debug(
            `Performing progress redeem and progress unstake for message hash:${message.messageHash}`,
          );
          const progressRedeemPromise = this.progressRedeem(message).catch((error) => {
            Logger.error('progressRedeemError', error);
          });
          const progressUnstakePromise = this.progressUnstake(message).catch((error) => {
            Logger.error('progressUnstakeError', error);
          });
          return Promise.all([progressRedeemPromise, progressUnstakePromise]);
        }
        return Promise.resolve();
      });

    await Promise.all(progressPromises);
  }

  /**
   * This is a private method which uses mosaic-contracts to make progressRedeem transaction.
   * @param message Message model object.
   * @returns Promise which resolves to transaction hash.
   */
  private async progressRedeem(message: Message): Promise<string> {
    Logger.debug(`Sending progress redeem transaction for message ${message.messageHash}`);
    const eip20CoGateway = interacts.getEIP20CoGateway(
      this.auxiliaryWeb3,
      this.coGatewayAddress,
    );
    const transactionOptions = {
      from: this.auxWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };

    const rawTx = eip20CoGateway.methods.progressRedeem(
      message.messageHash,
      message.secret!,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
      this.auxiliaryWeb3,
    ).then((txHash) => {
      Logger.debug(`Progress redeem transaction hash ${txHash} for message ${message.messageHash}`);
      return txHash;
    });
  }

  /**
   * This is a private method which uses mosaic-contracts to make progressUnstake transaction.
   * @param message Message model object.
   * @returns Promise which resolves to transaction hash.
   */
  private async progressUnstake(message: Message): Promise<string> {
    Logger.debug(`Sending progress unstake transaction for message ${message.messageHash}`);

    assert(message.gatewayAddress !== undefined);

    const gatewayRecord = await this.gatewayRepository.get(message.gatewayAddress as string);

    assert(
      gatewayRecord !== null,
      `Gateway record not found for gateway: ${message.gatewayAddress}`,
    );

    const eip20Gateway = interacts.getEIP20Gateway(
      this.originWeb3,
      (gatewayRecord as Gateway).remoteGatewayAddress,
    );

    const transactionOptions = {
      from: this.originWorkerAddress,
      gasPrice: ORIGIN_GAS_PRICE,
    };

    const rawTx = eip20Gateway.methods.progressUnstake(
      message.messageHash,
      message.secret!,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
      this.originWeb3,
    ).then((txHash) => {
      Logger.debug(`Progress unstake transaction hash ${txHash} for message ${message.messageHash}`);
      return txHash;
    });
  }
}
