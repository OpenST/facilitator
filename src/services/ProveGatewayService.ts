import assert from 'assert';
import BigNumber from 'bignumber.js';

import { ProofData, ProofGenerator } from '@openst/mosaic-proof';

import EIP20CoGateway from '../interacts/EIP20CoGateway';
import InteractsFactory from '../interacts/InteractsFactory';
import Logger from '../Logger';
import AuxiliaryChain from '../models/AuxiliaryChain';
import Observer from '../observer/Observer';
import GatewayRepository from '../repositories/GatewayRepository';
import { MessageRepository } from '../repositories/MessageRepository';

export default class ProveGatewayService extends Observer<AuxiliaryChain> {
  /* Storage */

  private gatewayAddress: string;

  private auxiliaryChainId: number;

  private gatewayRepository: GatewayRepository;

  private messageRepository: MessageRepository;

  private proofGenerator: ProofGenerator;

  private interactsFactory: InteractsFactory;


  /* Public Functions */

  /**
   * @param gatewayAddress Address of gateway contract on origin chain.
   * @param auxiliaryChainId Auxiliary chain Id.
   * @param gatewayRepository Instance of auxiliary chain repository.
   * @param messageRepository Instance of message repository.
   * @param proofGenerator Instance of a proof generator.
   * @param eip20CoGatewayFactory Instance of a EIP20 co-gateway factory.
   */
  public constructor(
    gatewayAddress: string,
    auxiliaryChainId: number,
    gatewayRepository: GatewayRepository,
    messageRepository: MessageRepository,
    proofGenerator: ProofGenerator,
    interactsFactory: InteractsFactory,
  ) {
    super();

    this.gatewayAddress = gatewayAddress;
    this.auxiliaryChainId = auxiliaryChainId;
    this.gatewayRepository = gatewayRepository;
    this.messageRepository = messageRepository;
    this.proofGenerator = proofGenerator;
    this.interactsFactory = interactsFactory;
  }

  /**
   * Reacts on changes in auxiliary chain models.
   *
   * @param auxiliaryChains Changed auxiliary chain models.
   */
  public async update(auxiliaryChains: AuxiliaryChain[]): Promise<void> {
    const auxiliaryChain: AuxiliaryChain | undefined = auxiliaryChains.find(
      (ch: AuxiliaryChain): boolean => ch.chainId === this.auxiliaryChainId
          && ch.lastOriginBlockHeight !== undefined,
    );

    if (auxiliaryChain !== undefined) {
      assert(auxiliaryChain.lastOriginBlockHeight !== undefined);
      await this.proveGateway(auxiliaryChain.lastOriginBlockHeight as BigNumber);
    }
  }

  /**
   * Performs prove gateway transaction on auxiliary chain.
   *
   * This method is not intended to use outside this class, it's public
   * temporarily, it will soon be made private.
   *
   * @param blockHeight Block height at which anchor state root happens.
   *
   * @returns A promise that resolves to the transaction hash and reason message.
   */
  private async proveGateway(
    blockHeight: BigNumber,
  ): Promise<{ transactionHash: string; message: string}> {
    const { gatewayAddress } = this;

    const gatewayRecord = await this.gatewayRepository.get(gatewayAddress);
    if (gatewayRecord === null) {
      const message = 'A gateway record for the given gateway address '
      + `(${this.gatewayAddress}) does not exist, hence skipping proving gateway.`;
      Logger.info(message);
      return {
        transactionHash: '',
        message,
      };
    }

    const pendingMessages = await this.messageRepository.hasPendingOriginMessages(
      blockHeight,
      this.gatewayAddress,
    );

    if (!pendingMessages) {
      const message = `There are no pending messages for gateway ${this.gatewayAddress}.`
      + ', hence skipping proving gateway';
      Logger.info(message);
      return {
        transactionHash: '',
        message,
      };
    }
    const coGatewayAddress = gatewayRecord.remoteGatewayAddress;

    Logger.info(`Generating proof for gateway address ${this.gatewayAddress} `
      + `at blockHeight ${blockHeight.toString()}`);

    const outboxProof: ProofData = await this.proofGenerator.getOutboxProof(
      gatewayAddress,
      [],
      blockHeight.toString(16),
    );

    Logger.info(`Proof generated encodedAccountValue ${outboxProof.encodedAccountValue} and `
    + `accountProof ${outboxProof.serializedAccountProof} `);

    assert(coGatewayAddress !== undefined);
    assert(outboxProof.encodedAccountValue !== undefined);
    assert(outboxProof.serializedAccountProof !== undefined);
    assert(outboxProof.block_number !== undefined);
    assert(blockHeight.comparedTo(new BigNumber(outboxProof.block_number as string)) === 0);

    const transactionHash = await this.prove(
      coGatewayAddress as string,
      blockHeight,
      outboxProof.encodedAccountValue as string,
      outboxProof.serializedAccountProof as string,
    );

    Logger.info(`Prove gateway transaction hash ${transactionHash}`);

    return { transactionHash, message: 'Gateway successfully proven' };
  }

  /**
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
  ): Promise<string> {
    const eip20CoGateway: EIP20CoGateway = this.interactsFactory.getEIP20CoGateway(
      ostCoGatewayAddress,
    );

    return eip20CoGateway.proveGateway(
      lastOriginBlockHeight,
      encodedAccountValue,
      serializedAccountProof,
    );
  }
}
