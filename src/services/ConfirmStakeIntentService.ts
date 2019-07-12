import Observer from "../observer/Observer";
import {MessageRepository} from "../repositories/MessageRepository";
import Gateway from "../models/Gateway";
import Message from "../models/Message";
import Utils from "../Utils";
import {AUXILIARY_GAS_PRICE} from "../Constants";

const Mosaic = require('@openst/mosaic.js');
const { ProofGenerator } = Mosaic.Utils;

import { interacts} from "@openst/mosaic-contracts";
import {EIP20CoGateway} from "@openst/mosaic-contracts/dist/interacts/EIP20CoGateway";
import StakeRequestRepository from "../repositories/StakeRequestRepository";

/**
 * Class collects all non confirmed pending messages and confirms those messages in parallel.
 */
export default class ConfirmStakeIntentService extends Observer<Gateway> {

  private messageRepository: MessageRepository;

  private stakeRequestRepository: StakeRequestRepository;

  private originWeb3: object;

  private auxiliaryWeb3: object;

  private gatewayAddress: string;

  private coGatewayAddress: string;

  private auxiliaryWorkerAddress: string;

  /**
   * Constructor of class ConfirmStakeIntentService;
   *
   * @param messageRepository Instance of message repository.
   * @param stakeRequestRepository Instance of stake request repository.
   * @param originWeb3 Instance of origin chain web3.
   * @param auxiliaryWeb3 Instance of auxiliary chain web3.
   * @param gatewayAddress Origin chain gateway address.
   * @param coGatewayAddress Auxiliary chain gateway address.
   * @param auxiliaryWorkerAddress Auxiliary chain werker address.
   */
  public constructor(
    messageRepository: MessageRepository,
    stakeRequestRepository: StakeRequestRepository,
    originWeb3: object,
    auxiliaryWeb3: object,
    gatewayAddress: string,
    coGatewayAddress: string,
    auxiliaryWorkerAddress: string,
  ) {
    super();

    this.messageRepository = messageRepository;
    this.stakeRequestRepository = stakeRequestRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.gatewayAddress = gatewayAddress;
    this.coGatewayAddress = coGatewayAddress;
    this.auxiliaryWorkerAddress = auxiliaryWorkerAddress;
  }

  /**
   * This method reacts on changes when GatewayProven entity is received.
   *
   * Gateway model object is selected because facilitator works for a gateway pair.
   * So for all gateways objects gatewayAddress will be same.
   *
   * Messages to be send for confirmation is selected and confirmStakeIntent is called.
   *
   * @param gateway List of Gateway models
   */
  public async update(gateway: Gateway[]): Promise<void> {
    const provenGateway: Gateway = gateway[0];
    const messages: Message[] = await this.messageRepository.getMessagesForConfirmation(
      provenGateway.gatewayAddress,
      provenGateway.lastRemoteGatewayProvenBlockHeight!,
    );

    const proofGenerator = new ProofGenerator(
      this.originWeb3,
      this.auxiliaryWeb3,
    );

    let confirmStakeIntentPromises = [];
    for( let i=0; i< messages.length; i++) {
      let message = messages[i];
      confirmStakeIntentPromises.push(this.confirmStakeIntent(
        proofGenerator,
        message,
        provenGateway)
      );
    }
    await Promise.all(confirmStakeIntentPromises);
  }

  /**
   * Generates outbox proof for a messageHash and sends confirmStakeIntent transaction.
   *
   * @param proofGenerator Instance of ProofGenerator class.
   * @param message Instance of Message object.
   * @param gateway Instance of Gateway object.
   */
  private async confirmStakeIntent(proofGenerator: any, message: Message, gateway: Gateway):
    Promise<string> {
    const {
      proofData,
    } = proofGenerator.getOutboxProof(
      this.gatewayAddress,
      [message.messageHash],
      gateway.lastRemoteGatewayProvenBlockHeight,
    );
    const eip20CoGateway: EIP20CoGateway = interacts.getEIP20CoGateway(
      this.auxiliaryWeb3,
      this.coGatewayAddress
    );
    const transactionOptions = {
      from: this.auxiliaryWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };
    const stakeRequest = await this.stakeRequestRepository.getByMessageHash(message.messageHash);
    const rawTx = await eip20CoGateway.methods.confirmStakeIntent(
        message.sender!,
        message.nonce!.toString(),
        stakeRequest!.beneficiary!,
        stakeRequest!.amount!.toString(),
        message.gasPrice!.toString(),
        message.gasLimit!.toString(),
        message.hashLock!,
        proofData.blockNumber,
        proofData.storageProof,
    );
    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
    );
  }
}