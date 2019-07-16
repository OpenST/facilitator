import Message from '../models/Message';
import { MessageStatus } from '../repositories/MessageRepository';
import Utils from '../Utils';
import { AUXILIARY_GAS_PRICE, ORIGIN_GAS_PRICE } from '../Constants';

import GatewayRepository from '../repositories/GatewayRepository';

const mosaicContract = require('@openst/mosaic-contracts');

/**
 * It facilitates progress staking and minting.
 */
export default class ProgressService {
  private originWeb3: any;

  private auxiliaryWeb3: any;

  private gatewayAddress: string;

  private originWorkerAddress: string;

  private auxWorkerAddress: string;

  private gatewayRepository: GatewayRepository;

  /**
   * @param gatewayRepository Instance of GatewayRepository.
   * @param originWeb3 Origin chain web3 object.
   * @param auxiliaryWeb3 Auxiliary chain web3 object
   * @param gatewayAddress Address of gateway contract.
   * @param originWorkerAddress Origin chain worker address.
   * @param auxWorkerAddress Auxiliary chain worker address.
   */
  public constructor(
    gatewayRepository: GatewayRepository,
    originWeb3: any,
    auxiliaryWeb3: any,
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
    const progressPromises = messages
      .filter(message => message.isValidSecret())
      .map(async (message) => {
        if (message.sourceStatus === MessageStatus.Declared
        && message.targetStatus === MessageStatus.Declared
        ) {
          return Promise.all([this.progressStake(message), this.progressMint(message)]);
        }

        if (message.sourceStatus === MessageStatus.Declared) {
          return this.progressStake(message);
        }

        if (message.targetStatus === MessageStatus.Declared) {
          return this.progressMint(message);
        }
        return Promise.resolve(); // may not be needed.
      });

    await Promise.all(progressPromises);
  }

  /**
   * This is a private method which uses mosaic.js to make progressStake transaction.
   * @param message Message model object.
   * @returns Promise which resolves to transaction hash.
   */
  private async progressStake(message: Message): Promise<string> {
    const eip20Gateway = mosaicContract.interacts.getEIP20Gateway(
      this.originWeb3,
      this.gatewayAddress,
    );
    const transactionOptions = {
      from: this.originWorkerAddress,
      gasPrice: ORIGIN_GAS_PRICE,
    };
    const rawTx = await eip20Gateway.methods.progressStake(
      message.messageHash,
      message.hashLock,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
    );
  }

  /**
   * This is a private method which uses mosaic.js to make progressMint transaction.
   * @param message Message model object.
   * @returns Promise which resolves to transaction hash.
   */
  private async progressMint(message: Message): Promise<string> {
    const gateway = await this.gatewayRepository.get(message.gatewayAddress!);
    console.log("gateway :- ",gateway);
    const eip20CoGateway = mosaicContract.interacts.getEIP20CoGateway(
      this.auxiliaryWeb3,
      gateway!.remoteGatewayAddress,
    );

    const transactionOptions = {
      from: this.auxWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };

    const rawTx = await eip20CoGateway.methods.progressMint(
      message.messageHash,
      message.hashLock,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
    );
  }
}
