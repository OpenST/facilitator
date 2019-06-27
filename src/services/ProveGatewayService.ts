import BigNumber from 'bignumber.js';
import { AuxiliaryChainRepository } from '../models/AuxiliaryChainRepository';

import Web3 = require('web3');

const Mosaic = require('@openst/mosaic.js');

export default class ProveGateway {
  private auxiliaryChainRepository: AuxiliaryChainRepository;

  private originWeb3: Web3;

  private auxiliaryWeb3: Web3;

  private auxiliaryWorkerAddress: string;

  /**
   *  Constructor
   *
   * @param auxiliaryChainRepository Instance of auxiliary chain repository.
   * @param originWeb3 Origin Web3 instance.
   * @param auxiliaryWeb3 Auxiliary Web3 instance.
   * @param auxiliaryWorkerAddress auxiliary worker address, this should be
   *                               unlocked and added in web3 wallet.
   */
  public constructor(
    auxiliaryChainRepository: AuxiliaryChainRepository,
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    auxiliaryWorkerAddress: string,
  ) {
    this.auxiliaryChainRepository = auxiliaryChainRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.auxiliaryWorkerAddress = auxiliaryWorkerAddress;
  }

  /**
   * This method performs prove gateway transaction on auxiliary chain.
   * This throws if auxiliary chain details doesn't exist.
   *
   * @param auxiliaryChainId Auxiliary chainId.
   *
   * @return Return a promise that resolves to receipt.
   */
  public async reactTo(auxiliaryChainId: number): Promise<object> {
    const auxiliaryChain = await this.auxiliaryChainRepository.get(auxiliaryChainId);
    if (auxiliaryChain === null) {
      return Promise.reject(new Error('Auxiliary chain record doesnot exists for given chainId'));
    }
    const { lastOriginBlockHeight, ostGatewayAddress, ostCoGatewayAddress } = auxiliaryChain!;

    const { ProofGenerator } = Mosaic.Utils;

    const proofGenerator = new ProofGenerator(this.originWeb3, this.auxiliaryWeb3);
    const { encodedAccountValue, serializedAccountProof } = await proofGenerator.getOutboxProof(
      ostGatewayAddress,
      [],
      lastOriginBlockHeight,
    );

    return this.prove(
      ostCoGatewayAddress,
      lastOriginBlockHeight!,
      encodedAccountValue,
      serializedAccountProof,
    );
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

    return await eip20CoGateway.proveGateway(
      lastOriginBlockHeight,
      encodedAccountValue,
      serializedAccountProof,
      { from: this.auxiliaryWorkerAddress },
    );
  }
}
