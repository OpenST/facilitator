import BigNumber from 'bignumber.js';
import { GatewayRepository } from '../models/GatewayRepository';
import { MessageRepository } from '../models/MessageRepository';

const Mosaic = require('@openst/mosaic.js');

export default class ProveGatewayService {
  private gatewayRepository: GatewayRepository;

  private messageRepository: MessageRepository;

  private originWeb3: object;

  private auxiliaryWeb3: object;

  private auxiliaryWorkerAddress: string;

  private gatewayAddress: string;

  /**
   *  Constructor
   *
   * @param gatewayRepository Instance of auxiliary chain repository.
   * @param messageRepository Instance of message repository.
   * @param originWeb3 Origin Web3 instance.
   * @param auxiliaryWeb3 Auxiliary Web3 instance.
   * @param auxiliaryWorkerAddress auxiliary worker address, this should be
   *                               unlocked and added in web3 wallet.
   * @param gatewayAddress Address of gateway contract on origin chain.

   */
  public constructor(
    gatewayRepository: GatewayRepository,
    messageRepository: MessageRepository,
    originWeb3: object,
    auxiliaryWeb3: object,
    auxiliaryWorkerAddress: string,
    gatewayAddress: string,
  ) {
    this.gatewayRepository = gatewayRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.auxiliaryWorkerAddress = auxiliaryWorkerAddress;
    this.gatewayAddress = gatewayAddress;
    this.messageRepository = messageRepository;
  }

  /**
   * This method performs prove gateway transaction on auxiliary chain.
   * This throws if auxiliary chain details doesn't exist.
   *
   * @param blockHeight Block height at which anchor state root happens.
   *
   * @return Return a promise that resolves to object which tell about success or failure.
   */
  public async reactTo(
    blockHeight: BigNumber,
  ): Promise<{success: boolean; receipt: object; message: string}> {
    const gatewayRecord = await this.gatewayRepository.get(this.gatewayAddress);
    if (gatewayRecord === null) {
      return Promise.reject(new Error('Gateway record record doesnot exists for given gateway'));
    }

    const booleanPromise = await this.messageRepository.isPendingMessages(
      blockHeight,
      this.gatewayAddress,
    );
    if (!booleanPromise) {
      return Promise.resolve(
        {
          success: true,
          receipt: {},
          message: 'There are no pending messages for this gateway.',
        },
      );
    }
    const { gatewayAddress } = this;
    const coGateway = gatewayRecord.remoteGatewayAddress;
    const { ProofGenerator } = Mosaic.Utils;

    const proofGenerator = new ProofGenerator(this.originWeb3, this.auxiliaryWeb3);
    const {
      encodedAccountValue,
      serializedAccountProof,
    } = await proofGenerator.getOutboxProof(
      gatewayAddress,
      [],
      blockHeight,
    );

    const receipt = await this.prove(
      coGateway,
      blockHeight,
      encodedAccountValue,
      serializedAccountProof,
    );
    return { success: true, receipt, message: 'Gateway successfully proven' };
  }

  /**
   * This is a private method which uses mosaic.js to make proveGateway transaction.
   *
   * @param ostCoGatewayAddress  ost co-gateway address.
   * @param lastOriginBlockHeight Block height at which latest state root is anchored.
   * @param encodedAccountValue RPL encoded value of gateway account.
   * @param serializedAccountProof RLP encoded value of account proof.
   *
   * @return Return a promise that resolves to receipt.
   */
  private async prove(
    ostCoGatewayAddress: string,
    lastOriginBlockHeight: BigNumber,
    encodedAccountValue: string,
    serializedAccountProof: string,
  ): Promise<object> {
    const { EIP20CoGateway } = Mosaic.ContractInteract;

    const eip20CoGateway = new EIP20CoGateway(this.auxiliaryWeb3, ostCoGatewayAddress);

    return eip20CoGateway.proveGateway(
      lastOriginBlockHeight,
      encodedAccountValue,
      serializedAccountProof,
      { from: this.auxiliaryWorkerAddress },
    );
  }
}