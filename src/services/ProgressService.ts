import Message from '../models/Message';
import { MessageStatus } from '../repositories/MessageRepository';
import Utils from '../Utils';
import { AUXILIARY_GAS_PRICE, ORIGIN_GAS_PRICE } from '../Constants';

const Mosaic = require('@openst/mosaic.js');
const web3utils = require('web3-utils');

/**
 * It facilitates progress staking and minting.
 */
class ProgressService {
  private originWeb3: any;

  private auxiliaryWeb3: any;

  private gatewayAddress: string;

  private originWorkerAddress: string;

  private auxWorkerAddress: string;

  /**
   * Constructor of ProgressService class.
   * @param originWeb3 Origin chain web3 object.
   * @param auxiliaryWeb3 Auxiliary chain web3 object
   * @param gatewayAddress Address of gateway contract.
   * @param originWorkerAddress Origin chain worker address.
   * @param auxWorkerAddress Auxiliary chain worker address.
   */
  public constructor(
    originWeb3: any,
    auxiliaryWeb3: any,
    gatewayAddress: string,
    originWorkerAddress: string,
    auxWorkerAddress: string,
  ) {
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
    for (let i = 0; i < messages.length; i+=1) {
      const message: Message = messages[i];
      if (message.sourceStatus === MessageStatus.Declared &&
        message.targetStatus === MessageStatus.Declared
      ) {
        await this.progressStake(message);
        await this.progressMint(message);
        Promise.all([await this.progressStake(message), await this.progressMint(message)]);
      }

      if (message.sourceStatus === MessageStatus.Declared) {
        await this.progressMint(message);
      }

      if (message.targetStatus === MessageStatus.Declared) {
        await this.progressMint(message);
      }
    }
  }

  /**
   * This is a private method which uses mosaic.js to make progressStake transaction.
   * @param message Message model object.
   * @returns Promise which resolves to transaction hash.
   */
  private async progressStake(message: Message): Promise<string> {
    this.verifySecret(message.hashLock!, message.secret!);

    const { EIP20Gateway } = Mosaic.ContractInteract;

    const eip20Gateway = new EIP20Gateway(this.originWeb3, this.gatewayAddress);

    const transactionOptions = {
      from: this.originWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };

    const rawTx = await eip20Gateway.progressStakeRawTx(
      message.messageHash,
      message.hashLock,
      transactionOptions,
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
    this.verifySecret(message.hashLock!, message.secret!);

    const { EIP20Cogateway } = Mosaic.ContractInteract;

    const eip20CoGateway = new EIP20Cogateway(this.auxiliaryWeb3, this.gatewayAddress);

    const transactionOptions = {
      from: this.auxWorkerAddress,
      gasPrice: ORIGIN_GAS_PRICE,
    };

    const rawTx = await eip20CoGateway.progressMintRawTx(
      message.messageHash,
      message.hashLock,
      transactionOptions,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
    );
  }

  /**
   * It generates hashLock from secret and verifies against the hashLock in Message object.
   * If generated hashLock and hashLock in Message object is different, it throws error.
   * @param hashLock Hashlock of the message.
   * @param secret Secret of the message.
   */
  /* eslint-disable class-methods-use-this */
  private verifySecret(hashLock: string, secret: string): void {
    const generatedHashLock = web3utils.keccak256(secret).toString();

    if (generatedHashLock === hashLock) {
      throw new Error('secret is incorrect');
    }
  }
}
