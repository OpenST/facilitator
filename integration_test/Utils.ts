import Web3 from 'web3';
import * as web3Utils from 'web3-utils';
import * as path from 'path';
import BigNumber from 'bignumber.js';
import { interacts } from '@openst/mosaic-contracts';
import { EIP20Token } from '@openst/mosaic-contracts/dist/interacts/EIP20Token';
import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { Organization } from '@openst/mosaic-contracts/dist/interacts/Organization';
import { OSTComposer } from '@openst/mosaic-contracts/dist/interacts/OSTComposer';
import { TransactionReceipt } from 'web3-core';
import { EIP20Gateway } from '@openst/mosaic-contracts/dist/interacts/EIP20Gateway';
import { EIP20CoGateway } from '@openst/mosaic-contracts/dist/interacts/EIP20CoGateway';
import Repositories from '../src/repositories/Repositories';
import Directory from '../src/Directory';
import StakeRequest from '../src/models/StakeRequest';
import assert from '../test/test_utils/assert';
import MosaicConfig from '../src/Config/MosaicConfig';
import { FacilitatorConfig } from '../src/Config/Config';
import Message from '../src/models/Message';
import Gateway from '../src/models/Gateway';
import AuxiliaryChain from '../src/models/AuxiliaryChain';
import { GatewayType } from '../src/repositories/GatewayRepository';
import * as Constants from './Constants.json';

import * as EthUtils from 'ethereumjs-util';

const workerPrefix = 'MOSAIC_ADDRESS_PASSW_';

/**
 * It contains common helper methods to test facilitator.
 */
export default class Utils {
  public originWeb3: Web3;

  public auxiliaryWeb3: Web3;

  public originFunder: string;

  public auxiliaryFunder: string;

  private ostComposer: string;

  public mosaicConfig: MosaicConfig;

  public facilitatorConfig: FacilitatorConfig;

  public static ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

  public originChain: string;

  /**
   * Constructor for utils class for initialization.
   * @param mosaicConfig Mosaic config object.
   * @param facilitatorConfig Facilitator config object.
   * @param auxChainId Auxiliary chain id.
   * @param originFunder Address of the funder on origin chain.
   * @param auxiliaryFunder Address of the funder on auxiliary chain.
   */
  public constructor(
    mosaicConfig: MosaicConfig,
    facilitatorConfig: FacilitatorConfig,
    auxChainId: number,
    originFunder: string,
    auxiliaryFunder: string,
  ) {
    this.facilitatorConfig = FacilitatorConfig.fromChain(auxChainId);
    this.mosaicConfig = mosaicConfig;
    this.originChain = facilitatorConfig.originChain;
    this.originWeb3 = new Web3(facilitatorConfig.chains[this.originChain].nodeRpc);
    this.auxiliaryWeb3 = new Web3(facilitatorConfig.chains[facilitatorConfig.auxChainId].nodeRpc);
    this.originWeb3.transactionConfirmationBlocks = 1;
    this.auxiliaryWeb3.transactionConfirmationBlocks = 1;
    this.ostComposer = this.mosaicConfig.originChain.contractAddresses.ostComposerAddress!;
    this.originFunder = originFunder;
    this.auxiliaryFunder = auxiliaryFunder;
  }

  /**
   * It sets the address of funder account on origin chain.
   * @param originFunder Address of the funder.
   */
  public setOriginFunder(originFunder: string): void {
    this.originFunder = originFunder;
  }

  /**
   * It sets the address of funder account on auxiliary chain.
   * @param auxiliaryFunder Address of the funder.
   */
  public setAuxiliaryFunder(auxiliaryFunder: string): void {
    this.auxiliaryFunder = auxiliaryFunder;
  }

  /**
   * It funds ETH on origin chain to beneficiary.
   * @param beneficiary Address of the account who is to be funded.
   * @param amountInETH Amount to be funded in ETH.
   * @returns Receipt of eth funding to beneficiary.
   */
  public async fundEthOnOrigin(
    beneficiary: string,
    amountInETH: BigNumber,
  ): Promise<TransactionReceipt> {
    return this.originWeb3.eth.sendTransaction(
      {
        from: this.originFunder,
        to: beneficiary,
        value: web3Utils.toWei(amountInETH.toString()),
      },
    );
  }

  /**
   * It funds OSTPrime on origin chain to beneficiary.
   * @param beneficiary Address of the account who is to be funded.
   * @param amountInEth Amount to be funded in ETH.
   * @returns Receipt of eth funding to beneficiary.
   */
  public async fundOSTPrimeOnAuxiliary(
    beneficiary: string,
    amountInEth: BigNumber,
  ): Promise<TransactionReceipt> {
    return this.auxiliaryWeb3.eth.sendTransaction(
      {
        from: this.auxiliaryFunder,
        to: beneficiary,
        value: web3Utils.toWei(amountInEth.toString()),
      },
    );
  }

  /**
   * It provides organization contract instance.
   * @returns Organization instance.
   */
  public async getOriginOrganizationInstance(): Promise<Organization> {
    const organizationAddress = await this.getOrganizationFromOSTComposer();

    return interacts.getOrganization(this.originWeb3, organizationAddress);
  }

  /**
   * It whitelists address of an account.
   * @param worker Address to be whitelisted.
   * @param expirationHeight Block number at which address becomes invalid.
   * @returns Receipt object.
   */
  public async whitelistOriginWorker(
    worker: string,
    expirationHeight: string,
  ): Promise<TransactionReceipt> {
    const organizationContractInstance = await this.getOriginOrganizationInstance();

    const owner = await organizationContractInstance.methods.owner().call();

    const setWorkerRawTx: TransactionObject<void> = organizationContractInstance.methods.setWorker(
      worker,
      expirationHeight,
    );

    const setWorkerReceipt = await this.sendTransaction(
      setWorkerRawTx,
      {
        from: owner,
        gasPrice: await this.originWeb3.eth.getGasPrice(),
      },
    );

    return setWorkerReceipt;
  }

  /**
   * It provides organization contract used in OSTComposer.
   * @returns Organization contract address.
   */
  public async getOrganizationFromOSTComposer(): Promise<string> {
    const ostComposerInstance = interacts.getOSTComposer(this.originWeb3, this.ostComposer);
    const organizationAddress = await ostComposerInstance.methods.organization().call();

    return organizationAddress;
  }

  /**
   * It anchors state root to auxiliary chain's Anchor contract.
   */
  public async anchorOrigin(auxChainId: number): Promise<number> {
    const organizationInstance = interacts.getOrganization(
      this.auxiliaryWeb3,
      this.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorOrganizationAddress,
    );

    const anchorInstance = interacts.getAnchor(
      this.auxiliaryWeb3,
      this.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorAddress,
    );

    const currentBlock = await this.originWeb3.eth.getBlock('latest');

    const owner = await organizationInstance.methods.owner().call();

    const anchorStateRootRawTx: TransactionObject<boolean> = anchorInstance.methods.anchorStateRoot(
      currentBlock.number,
      currentBlock.stateRoot,
    );

    await this.sendTransaction(
      anchorStateRootRawTx,
      {
        from: owner,
        gasPrice: await this.auxiliaryWeb3.eth.getGasPrice(),
      },
    );
    return currentBlock.number;
  }

  /**
   * It provides stake request hash.
   * @param stakeRequest It represents stake request object.
   * @param gateway Gateway address on which request stake is to be done.
   * @param ostComposer OSTComposer contract address.
   * @returns EIP712 compatible stakerequest hash.
   */
  public getStakeRequestHash(
    stakeRequest: StakeRequest,
    gateway: string,
    ostComposer: string,
  ): string {
    const stakeRequestMethod = 'StakeRequest(uint256 amount,address beneficiary,uint256 gasPrice,uint256 gasLimit,uint256 nonce,address staker,address gateway)';
    const encodedTypeHash = web3Utils.sha3(
      this.originWeb3.eth.abi.encodeParameter('string', stakeRequestMethod),
    );
    const stakeIntentTypeHash = web3Utils.soliditySha3(
      { type: 'bytes32', value: encodedTypeHash },
      { type: 'uint256', value: stakeRequest.amount!.toString(10) },
      { type: 'address', value: stakeRequest.beneficiary! },
      { type: 'uint256', value: stakeRequest.gasPrice!.toString(10) },
      { type: 'uint256', value: stakeRequest.gasLimit!.toString(10) },
      { type: 'uint256', value: stakeRequest.nonce!.toString(10) },
      { type: 'address', value: stakeRequest.staker! },
      { type: 'address', value: gateway },
    );

    const EIP712_DOMAIN_TYPEHASH = web3Utils.soliditySha3(
      'EIP712Domain(address verifyingContract)',
    );
    const DOMAIN_SEPARATOR = web3Utils.soliditySha3(
      this.originWeb3.eth.abi.encodeParameters(
        ['bytes32', 'address'],
        [EIP712_DOMAIN_TYPEHASH, ostComposer],
      ),
    );

    const eip712TypeData = EthUtils.keccak(
      Buffer.concat(
        [
          Buffer.from('19', 'hex'),
          Buffer.from('01', 'hex'),
          EthUtils.toBuffer(DOMAIN_SEPARATOR),
          EthUtils.toBuffer(stakeIntentTypeHash),
        ],
      ),
    );

    return EthUtils.bufferToHex(eip712TypeData);
  }

  /**
   * It provides repository object pointing to mosaic facilitator db file.
   * @returns Repositories object.
   */
  private async getRepositories(): Promise<Repositories> {
    return Repositories.create(
      path.join(
        Directory.getDBFilePath(this.facilitatorConfig.auxChainId.toString(10)),
        'mosaic_facilitator.db',
      ),
    );
  }

  /**
   * It returns auxiliary chain object for an auxiliary chain.
   * @param auxChainId Name of auxiliary chain.
   * @returns Auxiliary chain object.
   */
  public async getAuxiliaryChainFromDb(auxChainId: number): Promise<AuxiliaryChain | null> {
    const repos = await this.getRepositories();
    return repos.auxiliaryChainRepository.get(auxChainId);
  }

  /**
   * It returns stub object.
   * @param messageFromContract Message from gateway contract.
   * @param message Message object
   * @returns Message object.
   */
  public getMessageStub(
    messageFromContract: any,
    message: Message,
  ): Message {
    const messageObj = message;
    messageObj.gasPrice = new BigNumber(messageFromContract.gasPrice);
    messageObj.gasLimit = new BigNumber(messageFromContract.gasLimit);
    messageObj.hashLock = messageFromContract.hashLock;
    messageObj.nonce = new BigNumber(messageFromContract.nonce);
    messageObj.sender = messageFromContract.sender;
    return messageObj;
  }

  /**
   * Asserts the expected message data with the entry in messages table.
   * @param dbMessage Message object representing db state.
   * @param expectedStakeRequest Expected stake request object.
   */
  public assertMessages(
    dbMessage: Message,
    expectedMessage: Message,
  ): void {
    assert.strictEqual(
      dbMessage.nonce!.cmp(expectedMessage.nonce!),
      0,
      `Expected nonce value is ${dbMessage.nonce!} but got ${expectedMessage.nonce!}`,
    );

    assert.strictEqual(
      dbMessage.gatewayAddress!,
      expectedMessage.gatewayAddress!,
      'Incorrect gateway address',
    );

    assert.strictEqual(
      dbMessage.gasLimit!.cmp(expectedMessage.gasLimit!),
      0,
      `Expected gas limit is ${expectedMessage.gasLimit!} but got ${dbMessage.gasLimit!}`,
    );

    assert.strictEqual(
      dbMessage.gasPrice!.cmp(expectedMessage.gasPrice!),
      0,
      `Expected gas price is ${expectedMessage.gasPrice!} but got ${dbMessage.gasPrice!}`,
    );

    assert.strictEqual(
      dbMessage.direction,
      expectedMessage.direction,
      'Incorrect message direction',
    );

    assert.strictEqual(
      dbMessage.type!,
      expectedMessage.type!,
      'Incorrect message type',
    );

    assert.strictEqual(
      dbMessage.hashLock!,
      expectedMessage.hashLock!,
      'Hashlock is incorrect',
    );

    assert.strictEqual(
      dbMessage.sourceStatus!,
      expectedMessage.sourceStatus!,
      'Source status is incorrect',
    );

    assert.strictEqual(
      dbMessage.targetStatus!,
      expectedMessage.targetStatus!,
      'Target status is incorrect',
    );

    assert.strictEqual(
      dbMessage.sender!,
      expectedMessage.sender!,
      'Sender address is incorrect',
    );
  }

  /**
   * Asserts the expected stake request data with the entry in stakerequests table.
   * @param actualStakeRequest StakeRequest object representing db state.
   * @param expectedStakeRequest Expected stake request object.
   */
  public assertStakeRequests(
    actualStakeRequest: StakeRequest,
    expectedStakeRequest: StakeRequest,
  ): void {
    assert.strictEqual(
      actualStakeRequest.amount!.cmp(expectedStakeRequest.amount!),
      0,
      `Expected amount is ${expectedStakeRequest.amount} but got ${actualStakeRequest.amount}`,
    );

    assert.strictEqual(
      actualStakeRequest.nonce!.cmp(expectedStakeRequest.nonce!),
      0,
      `Expected amount is ${expectedStakeRequest.nonce!} but got ${actualStakeRequest.nonce!}`,
    );

    assert.strictEqual(
      actualStakeRequest.gasPrice!.cmp(expectedStakeRequest.gasPrice!),
      0,
      `Expected amount is ${expectedStakeRequest.gasPrice!} but got ${actualStakeRequest.gasPrice!}`,
    );

    assert.strictEqual(
      actualStakeRequest.gasLimit!.cmp(expectedStakeRequest.gasLimit!),
      0,
      `Expected amount is ${expectedStakeRequest.gasLimit!} but got ${actualStakeRequest.gasLimit!}`,
    );

    assert.strictEqual(
      actualStakeRequest.beneficiary!,
      expectedStakeRequest.beneficiary!,
      'Invalid beneficiary address',
    );

    assert.strictEqual(
      actualStakeRequest.gateway!,
      expectedStakeRequest.gateway!,
      'Invalid gateway address',
    );

    assert.strictEqual(
      actualStakeRequest.staker!,
      expectedStakeRequest.staker!,
      'Invalid stake address',
    );

    assert.strictEqual(
      actualStakeRequest.blockNumber!.cmp(expectedStakeRequest.blockNumber!),
      0,
      `Expected blocknumber at which stake request is done is `+
        `${expectedStakeRequest.blockNumber!}  but got ${expectedStakeRequest.blockNumber!},`
    );
  }

  /**
   * It provides Gateway model object for an gateway.
   * @returns Gateway model object if present otherwise null.
   */
  /**
   * It provides Gateway model object for an gateway.
   * @param gatewayAddress Gateway/Cogateway contract address.
   * @returns Gateway model object if present otherwise null.
   */
  public async getGateway(gatewayAddress: string): Promise<Gateway | null> {
    const repos: Repositories = await this.getRepositories();
    const gateway = await repos.gatewayRepository.get(
      gatewayAddress,
    );
    return gateway;
  }

  /**
   * Asserts the expected gateway data with the entry in gateway table.
   * @param actualGateway Object representing gateway in db.
   * @param expectedGateway Expected gateway object.
   */
  public assertGateway(actualGateway: Gateway, expectedGateway: Gateway): void {
    assert.strictEqual(
      actualGateway.gatewayAddress,
      expectedGateway.gatewayAddress,
      ' Invalid gateway address',
    );

    assert.strictEqual(
      actualGateway.chain,
      expectedGateway.chain,
      'Invalid chain value',
    );

    assert.strictEqual(
      actualGateway.tokenAddress,
      expectedGateway.tokenAddress,
      'Invalid token address',
    );

    assert.strictEqual(
      actualGateway.anchorAddress,
      expectedGateway.anchorAddress,
      'Invalid anchor address',
    );

    assert.strictEqual(
      actualGateway.lastRemoteGatewayProvenBlockHeight!.cmp(
        expectedGateway.lastRemoteGatewayProvenBlockHeight!,
      ),
      0,
      'Expected last remote gateway proven height is'
      + `${expectedGateway.lastRemoteGatewayProvenBlockHeight} but got `
      + `${actualGateway.lastRemoteGatewayProvenBlockHeight}`,
    );

    assert.strictEqual(
      actualGateway.activation,
      expectedGateway.activation,
      'Gateway should activated',
    );

    assert.strictEqual(
      actualGateway.bounty!.cmp(expectedGateway.bounty!),
      0,
      `Expected bounty value is ${actualGateway.bounty} but got ${expectedGateway.bounty}`,
    );
  }

  /**
   * It asserts auxiliary chain db with expected data.
   * @param lastOriginBlockHeight Blockheight at which anchoring is done from origin.
   * @param lastAuxiliaryBlockHeight Blockheight at which anchoring is done from auxiliary.
   * @returns Auxiliary chain object.
   */
  public getAuxiliaryChainStub(
    lastOriginBlockHeight: BigNumber,
    lastAuxiliaryBlockHeight: BigNumber,
  ): AuxiliaryChain {
    const { auxChainId } = this.facilitatorConfig;
    const { originChain } = this.facilitatorConfig;
    const auxiliaryChain = new AuxiliaryChain(
      auxChainId,
      originChain,
      this.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.ostEIP20GatewayAddress,
      this.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.ostEIP20CogatewayAddress,
      this.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorAddress,
      this.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorAddress,
      lastOriginBlockHeight,
      lastAuxiliaryBlockHeight,
    );

    return auxiliaryChain;
  }

  /**
   * It asserts auxiliary chain table with the expected values.
   * @param actualAuxiliaryChain Auxiliary chain object representing DB state.
   * @param expectedAuxiliaryChain Expected auxiliary chain object.
   */
  public assertAuxiliaryChain(
    actualAuxiliaryChain: AuxiliaryChain,
    expectedAuxiliaryChain: AuxiliaryChain,
  ): void {
    assert.strictEqual(
      actualAuxiliaryChain.lastOriginBlockHeight!.cmp(expectedAuxiliaryChain.lastOriginBlockHeight!),
      0,
      `Expected last origin block height is ${expectedAuxiliaryChain.lastOriginBlockHeight} but `
      + `got ${actualAuxiliaryChain.lastOriginBlockHeight}`,
    );

    assert.strictEqual(
      actualAuxiliaryChain.anchorAddress,
      expectedAuxiliaryChain.anchorAddress,
      'Incorrect anchor address',
    );

    assert.strictEqual(
      actualAuxiliaryChain.coAnchorAddress,
      expectedAuxiliaryChain.coAnchorAddress,
      'Incorrect anchor address',
    );

    assert.strictEqual(
      actualAuxiliaryChain.chainId,
      expectedAuxiliaryChain.chainId,
      'Incorrect anchor address',
    );

    assert.strictEqual(
      actualAuxiliaryChain.ostGatewayAddress,
      expectedAuxiliaryChain.ostGatewayAddress,
      'Incorrect gateway address',
    );

    assert.strictEqual(
      actualAuxiliaryChain.ostCoGatewayAddress,
      expectedAuxiliaryChain.ostCoGatewayAddress,
      'Incorrect ost cogateway address',
    );

    assert.strictEqual(
      actualAuxiliaryChain.originChainName,
      expectedAuxiliaryChain.originChainName,
      'Incorrect origin chain name',
    );
  }

  /**
   * It provides StakeRequest model object for an gateway.
   * @param stakeRequestHash Stake request hash for an stake.
   * @returns StakeRequest object corresponding to stakeRequestHash.
   */
  public async getStakeRequest(stakeRequestHash: string): Promise<StakeRequest | null> {
    const repos: Repositories = await this.getRepositories();

    return repos.stakeRequestRepository.get(
      stakeRequestHash,
    );
  }

  /**
   * It provides Message model object for an gateway.
   * @param messageHash Hash of the message.
   * @returns Message object corresponding to stakeRequestHash.
   */
  public async getMessageFromDB(messageHash: string | undefined): Promise<Message | null> {
    const repos: Repositories = await this.getRepositories();

    let message: Message | null = null;
    if (messageHash) {
      message = await repos.messageRepository.get(messageHash);
    }

    return message;
  }

  /**
   * It provides gateway stub object.
   * @param bounty Bounty for processing the stake and mint.
   * @param activation Activation status of the gateway.
   * @param gatewayType Type of the gateway.
   * @param anchoredBlockNumber Blockheight at which anchoring is done.
   * @returns Gateway stub object.
   */
  public getGatewayStub(
    bounty: string,
    activation: boolean,
    gatewayType: GatewayType,
    anchoredBlockNumber: BigNumber,
  ): Gateway {
    const { auxChainId } = this.facilitatorConfig;
    const gateway: Gateway = new Gateway(
      this.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.ostEIP20GatewayAddress!,
      this.facilitatorConfig.originChain,
      gatewayType,
      this.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.ostEIP20CogatewayAddress,
      this.mosaicConfig.originChain.contractAddresses.simpleTokenAddress,
      this.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorAddress,
      new BigNumber(bounty),
      activation,
      anchoredBlockNumber,
    );

    return gateway;
  }

  /**
   * It asserts minted balance of beneficiary at auxiliary chain.
   * @param beneficiary Address which received OSTPrime.
   * @param expectedMintedAmount Expected minted amount.
   */
  public async assertMintingBalance(
    beneficiary: string,
    expectedMintedAmount: BigNumber,
  ): Promise<void> {
    const actualMintedAmount = new BigNumber(await this.auxiliaryWeb3.eth.getBalance(beneficiary));

    assert.strictEqual(
      actualMintedAmount.cmp(expectedMintedAmount),
      0,
      `Expected minted balance is ${expectedMintedAmount} but got ${actualMintedAmount}`,
    );
  }

  /**
   * It verifies the ERC2O token transfer.
   * @param receipt Receipt of ERC20 transfer.
   * @param beneficiary Beneficiary of the transfer.
   * @param amount Amount which is transferred to beneficiary.
   */
  public async verifyOSTTransfer(
    receipt: TransactionReceipt,
    beneficiary: string,
    amount: BigNumber,
  ): Promise<void> {
    assert.strictEqual(receipt.status, true, 'Receipt status should be true');

    const simpletokenInstance = this.getSimpleTokenInstance();

    const beneficiaryBalance = await simpletokenInstance.methods.balanceOf(beneficiary).call();

    assert.strictEqual(
      amount.cmp(beneficiaryBalance),
      0,
      `Expected balance is  ${amount} but got ${beneficiaryBalance}`,
    );
  }

  /**
   * It provides EIP20Gateway contract instance.
   * @returns EIP20Gateway object.
   */
  public getEIP20GatewayInstance(): EIP20Gateway {
    const {
      ostEIP20GatewayAddress,
    } = this.mosaicConfig.auxiliaryChains[this.facilitatorConfig.auxChainId].contractAddresses.origin;
    const eip20GatewayInstance: EIP20Gateway = interacts.getEIP20Gateway(
      this.originWeb3,
      ostEIP20GatewayAddress,
    );
    return eip20GatewayInstance;
  }

  /**
   * It provides EIP20CoGateway contract instance.
   * @returns EIP20CoGateway object.
   */
  public getEIP20CoGatewayInstance(): EIP20CoGateway {
    const {
      ostEIP20CogatewayAddress,
    } = this.mosaicConfig.auxiliaryChains[this.facilitatorConfig.auxChainId].contractAddresses.auxiliary;
    const eip20CoGatewayInstance: EIP20CoGateway = interacts.getEIP20CoGateway(
      this.auxiliaryWeb3,
      ostEIP20CogatewayAddress,
    );
    return eip20CoGatewayInstance;
  }

  /**
   * It provides Simple Token contract instance.
   * @returns Simple token object.
   */
  public getSimpleTokenInstance(): EIP20Token {
    const { simpleTokenAddress } = this.mosaicConfig.originChain.contractAddresses;
    const simpletokenInstance: EIP20Token = interacts.getEIP20Token(
      this.originWeb3,
      simpleTokenAddress,
    );
    return simpletokenInstance;
  }

  /**
   * It provides OSTComposer instance.
   * @returns OSTComposer object.
   */
  public getOSTComposerInstance(): OSTComposer {
    return interacts.getOSTComposer(this.originWeb3, this.ostComposer);
  }

  /**
   * It provides time for completion of a test in secs.
   * @param durationInMins Duration in mins.
   * @returns End Time in secs.
   */
  public getEndTime(durationInMins: number): number {
    const durationInSecs = durationInMins * 60;
    const startTime = process.hrtime()[0];
    return startTime + durationInSecs;
  }

  /**
   * It sets environment variables. They are required for facilitator init and start script.
   * @param mosaicConfigPath Path to mosaic config.
   */
  public static setEnvironment(mosaicConfigPath: string): void {
    process.env.AUXILIARY_RPC = Constants.auxiliaryRpc;
    process.env.ORIGIN_RPC = Constants.originRpc;
    process.env.ORIGIN_GRAPH_RPC = Constants.originGraphRpc;
    process.env.AUXILIARY_GRAPH_RPC = Constants.auxiliaryGraphRpc;
    process.env.AUXILIARY_GRAPH_WS = Constants.auxiliaryGraphWs;
    process.env.ORIGIN_GRAPH_WS = Constants.originGraphWs;
    process.env.ORIGIN_WORKER_PASSWORD = Constants.originWorkerPassword;
    process.env.AUXILIARY_WORKER_PASSWORD = Constants.auxiliaryWorkerPassword;
    process.env.AUXILIARY_CHAIN_ID = Constants.auxChainId;
    process.env.MOSAIC_CONFIG_PATH = mosaicConfigPath;
    process.env.ORIGIN_CHAIN = Constants.originChain;
    process.env.ORIGIN_WORKER_PASSWORD = Constants.originWorkerPassword;
    process.env.AUXILIARY_WORKER_PASSWORD = Constants.auxiliaryWorkerPassword;
  }

  /**
   * It sets the origin and auxiliary worker password in environment.
   */
  public setWorkerPasswordInEnvironment(): void {
    const originWorker = this.facilitatorConfig.chains[this.facilitatorConfig.originChain].worker;
    const auxiliaryWorker = this.facilitatorConfig.chains[this.facilitatorConfig.auxChainId].worker;
    const originWorkerExport = workerPrefix + originWorker;
    const auxWorkerExport = workerPrefix + auxiliaryWorker;
    process.env[originWorkerExport] = Constants.originWorkerPassword;
    process.env[auxWorkerExport] = Constants.auxiliaryWorkerPassword;
  }

  /**
   * Nonce for the staker in gateway.
   * @param staker Staker address.
   * @returns Nonce for the staker.
   */
  public async getGatewayNonce(staker: string): Promise<string> {
    const gatewayInstance = this.getEIP20GatewayInstance();
    return gatewayInstance.methods.getNonce(staker).call();
  }

  /**
   * It sends the transaction to the network and returns receipt for the transaction.
   * @param tx Transaction object.
   * @param txOption Transaction options.
   * @returns Receipt for the transaction.
   */
  public async sendTransaction(tx: any, txOption: any): Promise<TransactionReceipt> {
    const txOptions = Object.assign({}, txOption);

    if (txOptions.gas === undefined) {
      txOptions.gas = await tx.estimateGas(txOptions);
    }

    return tx.send(txOptions);
  }
}
