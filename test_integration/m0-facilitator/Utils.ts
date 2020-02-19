import Web3 from 'web3';
import * as web3Utils from 'web3-utils';
import BigNumber from 'bignumber.js';
import { interacts } from '@openst/mosaic-contracts';
import { EIP20Token } from '@openst/mosaic-contracts/dist/interacts/EIP20Token';
import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { Organization } from '@openst/mosaic-contracts/dist/interacts/Organization';
import { OSTComposer } from '@openst/mosaic-contracts/dist/interacts/OSTComposer';
import { RedeemPool } from '@openst/mosaic-contracts/dist/interacts/RedeemPool';
import { TransactionReceipt } from 'web3-core';
import { EIP20Gateway } from '@openst/mosaic-contracts/dist/interacts/EIP20Gateway';
import { EIP20CoGateway } from '@openst/mosaic-contracts/dist/interacts/EIP20CoGateway';
import { OSTPrime } from '@openst/mosaic-contracts/dist/interacts/OSTPrime';
import * as EthUtils from 'ethereumjs-util';
import { UtilityToken } from '@openst/mosaic-contracts/dist/interacts/UtilityToken';
import Repositories from '../../src/m0-facilitator/repositories/Repositories';
import assert from '../../test/m0-facilitator/test_utils/assert';
import { FacilitatorConfig } from '../../src/m0-facilitator/Config/Config';
import Message from '../../src/m0-facilitator/models/Message';
import Gateway from '../../src/m0-facilitator/models/Gateway';
import AuxiliaryChain from '../../src/m0-facilitator/models/AuxiliaryChain';
import SharedStorage from './SharedStorage';
import Logger from '../../src/m0-facilitator/Logger';
import MessageTransferRequest from '../../src/m0-facilitator/models/MessageTransferRequest';
import { MessageStatus } from '../../src/m0-facilitator/repositories/MessageRepository';
import GatewayAddresses from '../../src/m0-facilitator/Config/GatewayAddresses';

// This class variable is used to persist web3 connections
const urlToWeb3ConnectionsMap: Record<string, Web3> = {};

/**
 * It contains common helper methods to test facilitator.
 */
export default class Utils {
  public originWeb3: Web3;

  public auxiliaryWeb3: Web3;

  private stakePoolAddress: string;

  private redeemPool: string;

  private utilityTokenAddresses: string;

  public gatewayAddresses: GatewayAddresses;

  public facilitatorConfig: FacilitatorConfig;

  public originChain: string;

  /**
   * Constructor for utils class for initialization.
   */
  public constructor() {
    this.facilitatorConfig = SharedStorage.getFacilitatorConfig();
    this.gatewayAddresses = SharedStorage.getGatewayAddresses();
    this.originChain = this.facilitatorConfig.originChain;
    this.originWeb3 = Utils.getWeb3Connection(this.facilitatorConfig.chains[this.originChain].nodeRpc);
    this.auxiliaryWeb3 = Utils.getWeb3Connection(
      this.facilitatorConfig.chains[this.facilitatorConfig.auxChainId].nodeRpc,
    );
    this.originWeb3.transactionConfirmationBlocks = 1;
    this.auxiliaryWeb3.transactionConfirmationBlocks = 1;
    this.stakePoolAddress = this.gatewayAddresses.stakePoolAddress;
    this.redeemPool = this.gatewayAddresses.redeemPoolAddress;
    this.utilityTokenAddresses = this.gatewayAddresses.utilityTokenAddress;
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
        from: SharedStorage.getOriginFunder(),
        to: beneficiary,
        value: web3Utils.toWei(amountInETH.toString()),
      },
    );
  }

  /**
   * It funds OSTPrime on chain to beneficiary.
   * @param beneficiary Address of the account who is to be funded.
   * @param amountInWei Amount to be funded in Wei.
   * @returns Receipt of eth funding to beneficiary.
   */
  public async fundOSTPrimeOnAuxiliary(
    beneficiary: string,
    amountInWei: BigNumber,
  ): Promise<TransactionReceipt> {
    return this.auxiliaryWeb3.eth.sendTransaction(
      {
        from: SharedStorage.getAuxiliaryFunder(),
        to: beneficiary,
        value: amountInWei.toString(),
      },
    );
  }

  /**
   * It provides origin organization contract instance.
   * @returns Organization instance.
   */
  public async getOriginOrganizationInstance(): Promise<Organization> {
    const organizationAddress = await this.getOrganizationFromStakePool();
    return interacts.getOrganization(this.originWeb3, organizationAddress);
  }

  /**
   * It provides auxiliary organization contract instance.
   * @returns Organization instance.
   */
  public async getAuxiliaryOrganizationInstance(): Promise<Organization> {
    const organizationAddress = await this.getOrganizationFromRedeemPool();
    return interacts.getOrganization(this.auxiliaryWeb3, organizationAddress);
  }

  /**
   * It whitelists address of an account.
   * @param organizationContractInstance organization contract instance
   * @param worker Address to be whitelisted.
   * @param expirationHeight Block number at which address becomes invalid.
   * @returns Receipt object.
   */
  public async whitelistOriginWorker(
    organizationContractInstance: Organization,
    worker: string,
    expirationHeight: string,
  ): Promise<TransactionReceipt> {
    return this.whitelistWorker(
      this.originWeb3,
      organizationContractInstance,
      worker,
      expirationHeight,
    );
  }

  /**
   * It whitelists address of an account.
   * @param organizationContractInstance organization contract instance
   * @param worker Address to be whitelisted.
   * @param expirationHeight Block number at which address becomes invalid.
   * @returns Receipt object.
   */
  public async whitelistAuxiliaryWorker(
    organizationContractInstance: Organization,
    worker: string,
    expirationHeight: string,
  ): Promise<TransactionReceipt> {
    return this.whitelistWorker(
      this.auxiliaryWeb3,
      organizationContractInstance,
      worker,
      expirationHeight,
    );
  }

  /**
   * It whitelists address of an account.
   * @param web3 web3Instance
   * @param organizationContractInstance organization contract instance
   * @param worker Address to be whitelisted.
   * @param expirationHeight Block number at which address becomes invalid.
   * @returns Receipt object.
   */
  private async whitelistWorker(
    web3: Web3,
    organizationContractInstance: Organization,
    worker: string,
    expirationHeight: string,
  ): Promise<TransactionReceipt> {
    const owner = await organizationContractInstance.methods.owner().call();

    const setWorkerRawTx: TransactionObject<void> = organizationContractInstance.methods.setWorker(
      worker,
      expirationHeight,
    );

    return Utils.sendTransaction(
      setWorkerRawTx,
      {
        from: owner,
        gasPrice: await web3.eth.getGasPrice(),
      },
    );
  }

  /**
   * It provides organization contract used in StakePool.
   * @returns Organization contract address.
   */
  public async getOrganizationFromStakePool(): Promise<string> {
    const stakePoolInstance = interacts.getOSTComposer(this.originWeb3, this.stakePoolAddress);
    return await stakePoolInstance.methods.organization().call();
  }

  /**
   * It provides organization contract used in RedeemPool.
   * @returns Organization contract address.
   */
  public async getOrganizationFromRedeemPool(): Promise<string> {
    const redeemPoolInstance = interacts.getRedeemPool(this.auxiliaryWeb3, this.redeemPool);
    return await redeemPoolInstance.methods.organization().call();
  }

  /**
   * It anchors state root to auxiliary chain's anchor contract.
   */
  public async anchorOrigin(): Promise<number> {
    const organizationInstance = interacts.getOrganization(
      this.auxiliaryWeb3,
      this.gatewayAddresses.auxiliaryAnchorOrganizationAddress,
    );

    const anchorInstance = interacts.getAnchor(
      this.auxiliaryWeb3,
      this.gatewayAddresses.auxiliaryAnchorAddress,
    );

    const currentBlock = await this.originWeb3.eth.getBlock('latest');

    const owner = await organizationInstance.methods.owner().call();

    const anchorStateRootRawTx: TransactionObject<boolean> = anchorInstance.methods.anchorStateRoot(
      currentBlock.number,
      currentBlock.stateRoot,
    );

    await Utils.sendTransaction(
      anchorStateRootRawTx,
      {
        from: owner,
        gasPrice: await this.auxiliaryWeb3.eth.getGasPrice(),
      },
    );
    return currentBlock.number;
  }

  /**
   * It anchors state root to origin chain's anchor contract.
   */
  public async anchorAuxiliary(): Promise<number> {
    const organizationInstance = interacts.getOrganization(
      this.originWeb3,
      this.gatewayAddresses.originAnchorOrganizationAddress,
    );
    const owner = await organizationInstance.methods.owner().call();

    const anchorInstance = interacts.getAnchor(
      this.originWeb3,
      this.gatewayAddresses.originAnchorAddress,
    );

    const currentBlock = await this.auxiliaryWeb3.eth.getBlock('latest');

    const anchorStateRootRawTx: TransactionObject<boolean> = anchorInstance.methods.anchorStateRoot(
      currentBlock.number,
      currentBlock.stateRoot,
    );

    await Utils.sendTransaction(
      anchorStateRootRawTx,
      {
        from: owner,
        gasPrice: await this.originWeb3.eth.getGasPrice(),
      },
    );
    return currentBlock.number;
  }

  /**
   * It provides stake request hash.
   * @param messageTransferRequest It represents message transfer request object.
   * @param gateway Gateway address on which request stake is to be done.
   * @param stakePool StakePool contract address.
   * @returns EIP712 compatible stakerequest hash.
   */
  public getStakeRequestHash(
    messageTransferRequest: MessageTransferRequest,
    gateway: string,
    stakePool: string,
  ): string {
    const stakeRequestMethod = 'StakeRequest(uint256 amount,address beneficiary,uint256 gasPrice,uint256 gasLimit,uint256 nonce,address staker,address gateway)';
    const encodedTypeHash = web3Utils.sha3(
      this.originWeb3.eth.abi.encodeParameter('string', stakeRequestMethod),
    );
    const stakeIntentTypeHash = web3Utils.soliditySha3(
      { type: 'bytes32', value: encodedTypeHash },
      { type: 'uint256', value: messageTransferRequest.amount.toString(10) },
      { type: 'address', value: messageTransferRequest.beneficiary },
      { type: 'uint256', value: messageTransferRequest.gasPrice.toString(10) },
      { type: 'uint256', value: messageTransferRequest.gasLimit.toString(10) },
      { type: 'uint256', value: messageTransferRequest.nonce.toString(10) },
      { type: 'address', value: messageTransferRequest.sender },
      { type: 'address', value: gateway },
    );

    const EIP712_DOMAIN_TYPEHASH = web3Utils.soliditySha3(
      'EIP712Domain(address verifyingContract)',
    );
    const DOMAIN_SEPARATOR = web3Utils.soliditySha3(
      this.originWeb3.eth.abi.encodeParameters(
        ['bytes32', 'address'],
        [EIP712_DOMAIN_TYPEHASH, stakePool],
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
   * It provides redeem request hash.
   * @param messageTransferRequest It represents message transfer request object.
   * @param cogateway CoGateway address on which request redeem is to be done.
   * @param redeemPool RedeemPool contract address.
   * @returns EIP712 compatible stakerequest hash.
   */
  public getRedeemRequestHash(
    messageTransferRequest: MessageTransferRequest,
    cogateway: string,
    redeemPool: string,
  ): string {
    const redeemRequestMethod = 'RedeemRequest(uint256 amount,address beneficiary,uint256 gasPrice,uint256 gasLimit,uint256 nonce,address redeemer,address cogateway)';
    const encodedTypeHash = web3Utils.sha3(
      this.auxiliaryWeb3.eth.abi.encodeParameter('string', redeemRequestMethod),
    );
    const redeemIntentTypeHash = web3Utils.soliditySha3(
      { type: 'bytes32', value: encodedTypeHash },
      { type: 'uint256', value: messageTransferRequest.amount!.toString(10) },
      { type: 'address', value: messageTransferRequest.beneficiary! },
      { type: 'uint256', value: messageTransferRequest.gasPrice!.toString(10) },
      { type: 'uint256', value: messageTransferRequest.gasLimit!.toString(10) },
      { type: 'uint256', value: messageTransferRequest.nonce!.toString(10) },
      { type: 'address', value: messageTransferRequest.sender! },
      { type: 'address', value: cogateway },
    );

    const EIP712_DOMAIN_TYPEHASH = web3Utils.soliditySha3(
      'EIP712Domain(address verifyingContract)',
    );
    const DOMAIN_SEPARATOR = web3Utils.soliditySha3(
      this.auxiliaryWeb3.eth.abi.encodeParameters(
        ['bytes32', 'address'],
        [EIP712_DOMAIN_TYPEHASH, redeemPool],
      ),
    );

    const eip712TypeData = EthUtils.keccak(
      Buffer.concat(
        [
          Buffer.from('19', 'hex'),
          Buffer.from('01', 'hex'),
          EthUtils.toBuffer(DOMAIN_SEPARATOR),
          EthUtils.toBuffer(redeemIntentTypeHash),
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
      this.facilitatorConfig.database.path,
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
   * It provides Message stub object.
   * @param messageFromContract Message from gateway contract.
   * @param message Message object
   * @returns Message object.
   */
  public static getMessageStub(
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
   * @param actualObject Message object representing db state.
   * @param expectedObject Expected stake request object.
   */
  public static assertMessages(
    actualObject: Message,
    expectedObject: Message,
  ): void {
    assert.strictEqual(
      actualObject.nonce!.cmp(expectedObject.nonce!),
      0,
      `Expected nonce value is ${actualObject.nonce!} but got ${expectedObject.nonce!}`,
    );

    assert.strictEqual(
      actualObject.gatewayAddress!,
      expectedObject.gatewayAddress!,
      'Incorrect gateway address',
    );

    assert.strictEqual(
      actualObject.gasLimit!.cmp(expectedObject.gasLimit!),
      0,
      `Expected gas limit is ${expectedObject.gasLimit!} but got ${actualObject.gasLimit!}`,
    );

    assert.strictEqual(
      actualObject.gasPrice!.cmp(expectedObject.gasPrice!),
      0,
      `Expected gas price is ${expectedObject.gasPrice!} but got ${actualObject.gasPrice!}`,
    );

    assert.strictEqual(
      actualObject.direction,
      expectedObject.direction,
      'Incorrect message direction',
    );

    assert.strictEqual(
      actualObject.type!,
      expectedObject.type!,
      'Incorrect message type',
    );

    if (actualObject.sourceStatus !== MessageStatus.Undeclared) {
      assert.strictEqual(
        actualObject.hashLock!,
        expectedObject.hashLock!,
        'Hashlock is incorrect',
      );
    }

    assert.strictEqual(
      actualObject.sender!,
      expectedObject.sender!,
      'Sender address is incorrect',
    );
  }

  /**
   * Asserts the expected message transfer request data with the entry in stakerequests table.
   * @param actualObject MessageTransferRequest object representing db state.
   * @param expectedObject Expected stake request object.
   */
  public static assertMessageTransferRequests(
    actualObject: MessageTransferRequest,
    expectedObject: MessageTransferRequest,
  ): void {
    assert.strictEqual(
      actualObject.amount!.cmp(expectedObject.amount!),
      0,
      `Expected amount is ${expectedObject.amount} but got ${actualObject.amount}`,
    );

    assert.strictEqual(
      actualObject.nonce!.cmp(expectedObject.nonce!),
      0,
      `Expected amount is ${expectedObject.nonce!} but got ${actualObject.nonce!}`,
    );

    assert.strictEqual(
      actualObject.gasPrice!.cmp(expectedObject.gasPrice!),
      0,
      `Expected amount is ${expectedObject.gasPrice!} but got ${actualObject.gasPrice!}`,
    );

    assert.strictEqual(
      actualObject.gasLimit!.cmp(expectedObject.gasLimit!),
      0,
      `Expected amount is ${expectedObject.gasLimit!} but got ${actualObject.gasLimit!}`,
    );

    assert.strictEqual(
      actualObject.beneficiary!,
      expectedObject.beneficiary!,
      'Invalid beneficiary address',
    );

    assert.strictEqual(
      actualObject.gateway!,
      expectedObject.gateway!,
      'Invalid gateway address',
    );

    assert.strictEqual(
      actualObject.sender!,
      expectedObject.sender!,
      'Invalid stake address',
    );

    assert.strictEqual(
      actualObject.blockNumber.cmp(expectedObject.blockNumber),
      0,
      'Expected blocknumber at which stake request is done is '
      + `${expectedObject.blockNumber}  but got ${expectedObject.blockNumber},`,
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
  public static assertGateway(actualGateway: Gateway, expectedGateway: Gateway): void {
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
      actualGateway.lastRemoteGatewayProvenBlockHeight.cmp(
        expectedGateway.lastRemoteGatewayProvenBlockHeight,
      ),
      0,
      'Expected last remote gateway proven height is'
      + `${expectedGateway.lastRemoteGatewayProvenBlockHeight} but got `
      + `${actualGateway.lastRemoteGatewayProvenBlockHeight}`,
    );

    assert.strictEqual(
      actualGateway.activation!,
      expectedGateway.activation!,
      'Gateway should activated',
    );

    assert.strictEqual(
      actualGateway.bounty.cmp(expectedGateway.bounty!),
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
    const { originChain, auxChainId } = this.facilitatorConfig;
    const auxiliaryChain = new AuxiliaryChain(
      auxChainId,
      originChain,
      this.gatewayAddresses.eip20GatewayAddress,
      this.gatewayAddresses.eip20CoGatewayAddress,
      this.gatewayAddresses.originAnchorAddress,
      this.gatewayAddresses.auxiliaryAnchorAddress,
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
  public static assertAuxiliaryChain(
    actualAuxiliaryChain: AuxiliaryChain,
    expectedAuxiliaryChain: AuxiliaryChain,
  ): void {
    assert.strictEqual(
      actualAuxiliaryChain.lastOriginBlockHeight!
        .cmp(expectedAuxiliaryChain.lastOriginBlockHeight!),
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
      actualAuxiliaryChain.eip20GatewayAddress,
      expectedAuxiliaryChain.eip20GatewayAddress,
      'Incorrect gateway address',
    );

    assert.strictEqual(
      actualAuxiliaryChain.eip20CoGatewayAddress,
      expectedAuxiliaryChain.eip20CoGatewayAddress,
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
   * @param messageTransferRequestHash Stake request hash for an stake.
   * @returns StakeRequest object corresponding to stakeRequestHash.
   */
  public async getMessageTransferRequest(messageTransferRequestHash: string):
  Promise<MessageTransferRequest | null> {
    const repos: Repositories = await this.getRepositories();

    return repos.messageTransferRequestRepository.get(
      messageTransferRequestHash,
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
   * It gets OST Prime balance from auxiliary chain.
   * @param beneficiary Address which received OSTPrime.
   */
  public async getOSTPrimeBalance(
    beneficiary: string,
  ): Promise<BigNumber> {
    return new BigNumber(await this.auxiliaryWeb3.eth.getBalance(beneficiary));
  }

  /**
   * It gets Utility token balance from auxiliary chain.
   * @param beneficiary Address which received Utility token.
   */
  public async getUtilityTokenBalance(
    beneficiary: string,
  ): Promise<BigNumber> {
    const utilityTokenInstance = await this.getUtilityTokenInstance();
    const balance = await utilityTokenInstance.methods.balanceOf(beneficiary).call();
    return new BigNumber(balance);
  }

  /**
   * It asserts unstaked balance of beneficiary at origin chain.
   * @param beneficiary Address which received OST.
   * @param expectedAmount Expected minted amount.
   */
  public async assertUnstakedBalance(
    beneficiary: string,
    expectedAmount: BigNumber,
  ): Promise<void> {
    const valueTokenInstance = this.getValueTokenInstance();
    const actualUnstakedAmount = await valueTokenInstance.methods.balanceOf(beneficiary).call();
    assert.strictEqual(
      new BigNumber(actualUnstakedAmount).cmp(expectedAmount),
      0,
      `Expected unStaked balance is ${expectedAmount} but got ${actualUnstakedAmount}`,
    );
  }

  /**
   * It verifies the base token transfer. Beneficiary address is always newly created one.
   * @param receipt Receipt of base token transfer.
   * @param beneficiary Beneficiary of the transfer.
   * @param amount Amount which is transferred to beneficiary.
   */
  public async verifyBaseTokenTransfer(
    receipt: TransactionReceipt,
    beneficiary: string,
    amount: BigNumber,
  ): Promise<void> {
    assert.strictEqual(receipt.status, true, 'Receipt status should be true');

    const baseTokenInstance = this.getBaseTokenInstance();
    const beneficiaryBalance = await baseTokenInstance.methods.balanceOf(beneficiary).call();

    assert.strictEqual(
      amount.cmp(beneficiaryBalance),
      0,
      `Expected balance is ${amount} but got ${beneficiaryBalance}`,
    );
  }

  /**
   * It verifies the value token transfer. Beneficiary address is always newly created one.
   * @param receipt Receipt of value token transfer.
   * @param beneficiary Beneficiary of the transfer.
   * @param amount Amount which is transferred to beneficiary.
   */
  public async verifyValueTokenTransfer(
    receipt: TransactionReceipt,
    beneficiary: string,
    amount: BigNumber,
  ): Promise<void> {
    assert.strictEqual(receipt.status, true, 'Receipt status should be true');

    const valueTokenInstance = this.getValueTokenInstance();
    const beneficiaryBalance = await valueTokenInstance.methods.balanceOf(beneficiary).call();

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
    const { eip20GatewayAddress } = this.gatewayAddresses;
    const eip20GatewayInstance: EIP20Gateway = interacts.getEIP20Gateway(
      this.originWeb3,
      eip20GatewayAddress,
    );
    return eip20GatewayInstance;
  }

  /**
   * It provides EIP20CoGateway contract instance.
   * @returns EIP20CoGateway object.
   */
  public getEIP20CoGatewayInstance(): EIP20CoGateway {
    const { eip20CoGatewayAddress } = this.gatewayAddresses;
    const eip20CoGatewayInstance: EIP20CoGateway = interacts.getEIP20CoGateway(
      this.auxiliaryWeb3,
      eip20CoGatewayAddress,
    );
    return eip20CoGatewayInstance;
  }

  /**
   * It provides Base Token contract instance.
   * @returns Base token object.
   */
  public getBaseTokenInstance(): EIP20Token {
    const { baseTokenAddress } = this.gatewayAddresses;
    return interacts.getEIP20Token(
      this.originWeb3,
      baseTokenAddress,
    );
  }

  /**
   * It provides Value Token contract instance.
   * @returns Value token object.
   */
  public getValueTokenInstance(): EIP20Token {
    const { valueTokenAddress } = this.gatewayAddresses;
    return interacts.getEIP20Token(
      this.originWeb3,
      valueTokenAddress,
    );
  }

  /**
   * It provides Simple Token Prime contract instance.
   * @returns Simple token Prime object.
   */
  public getSimpleTokenPrimeInstance(): OSTPrime {
    return interacts.getOSTPrime(
      this.auxiliaryWeb3,
      this.utilityTokenAddresses,
    );
  }

  /**
   * It provides Utility Token contract instance.
   * @returns Utility token  object.
   */
  public getUtilityTokenInstance(): UtilityToken {
    return interacts.getUtilityToken(
      this.auxiliaryWeb3,
      this.utilityTokenAddresses,
    );
  }

  /**
   * It provides stakePool instance.
   * @returns stakePool object.
   */
  public getStakePoolInstance(): OSTComposer {
    return interacts.getOSTComposer(this.originWeb3, this.stakePoolAddress);
  }

  /**
   * It provides RedeemPool instance.
   * @returns RedeemPool object.
   */
  public getRedeemPoolInstance(): RedeemPool {
    return interacts.getRedeemPool(this.auxiliaryWeb3, this.redeemPool);
  }

  /**
   * It provides time for completion of a test in secs.
   * @param durationInMins Duration in mins.
   * @returns End Time in secs.
   */
  public static getEndTime(durationInMins: number): number {
    const durationInSecs = durationInMins * 60;
    const startTime = process.hrtime()[0];
    return startTime + durationInSecs;
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
  public static async sendTransaction(tx: any, txOption: any): Promise<TransactionReceipt> {
    const txOptions = Object.assign({}, txOption);

    if (txOptions.gas === undefined) {
      txOptions.gas = await tx.estimateGas(txOptions);
    }

    return new Promise(async (onResolve, onReject): Promise<void> => {
      tx.send(txOptions)
        .on('transactionHash', (hash: string): any => Logger.debug(`submitted txHash: ${hash}`))
        .on('receipt', (receipt: TransactionReceipt): void => onResolve(receipt))
        .on('error', (error: Error): void => onReject(error));
    });
  }

  /**
   * It verifies whether source status is undeclared and target status is undeclared in db.
   * @param messageObject Instance of message object.
   * @returns `true` if source status is undeclared and target status is undeclared in db otherwise
   *           false.
   */
  public static isSourceUndeclaredTargetUndeclared(
    messageObject: Message,
  ): boolean {
    return (
      messageObject.sourceStatus === MessageStatus.Undeclared
      && messageObject.targetStatus === MessageStatus.Undeclared
    );
  }

  /**
   * It verifies whether source status is declared and target status is undeclared in db.
   * @param messageObject Instance of message object.
   * @returns `true` if source status is declared and target status is undeclared in db otherwise
   *           false.
   */
  public static isSourceDeclaredTargetUndeclared(
    messageObject: Message,
  ): boolean {
    return (
      messageObject.sourceStatus === MessageStatus.Declared
      && messageObject.targetStatus === MessageStatus.Undeclared
    );
  }

  /**
   * It verifies whether source status is declared and target status is declared in db.
   * @param messageObject Instance of message object.
   * @returns `true` if source status is declared and target status is declared in db otherwise
   *           false.
   */
  public static isSourceDeclaredTargetDeclared(
    messageObject: Message,
  ): boolean {
    return (
      messageObject.sourceStatus === MessageStatus.Declared
      && messageObject.targetStatus === MessageStatus.Declared
    );
  }

  /**
   * It verifies whether source status is declared and target status is progressed in db.
   * @param messageObject Instance of message object.
   * @returns `true` if source status is declared and target status is progressed in db otherwise
   *           false.
   */
  public static isSourceDeclaredTargetProgressed(
    messageObject: Message,
  ): boolean {
    return (
      messageObject.sourceStatus === MessageStatus.Declared
      && messageObject.targetStatus === MessageStatus.Progressed
    );
  }

  /**
   * It verifies whether source status is progressed and target status is declared in db.
   * @param messageObject Instance of message object.
   * @returns `true` if source status is progressed and target status is declared in db otherwise
   *           false.
   */
  public static isSourceProgressedTargetDeclared(
    messageObject: Message,
  ): boolean {
    return (
      messageObject.sourceStatus === MessageStatus.Progressed
      && messageObject.targetStatus === MessageStatus.Declared
    );
  }

  /**
   * It verifies whether source status is progressed and target status is progressed in db.
   * @param messageObject Instance of message object.
   * @returns `true` if source status is progressed and target status is progressed in db otherwise
   *           false.
   */
  public static isSourceProgressedTargetProgressed(
    messageObject: Message,
  ): boolean {
    return (
      messageObject.sourceStatus === MessageStatus.Progressed
      && messageObject.targetStatus === MessageStatus.Progressed
    );
  }

  /**
   * It provides string equivalent of the message status.
   * @param key Key value for which string equivalent is required.
   * @returns String representation of the key if present otherwise empty.
   */
  public static getEnumValue(key: number): string {
    let status = '';
    switch (key) {
      case 0:
        status = 'undeclared';
        break;
      case 1:
        status = 'declared';
        break;
      case 2:
        status = 'progressed';
        break;
      default:
        break;
    }
    return status;
  }

  /**
   * It verifies the status of message on gatway and cogateway with the status in db.
   * @param sourceMessageStatus Status of message on gateway.
   * @param destinationMessageStatus Status of message on cogateway.
   * @param messageObject Message object.
   * @returns returns true if any the condition is satisfied otherwise false.
   */
  public static isMessageStatusValid(
    sourceMessageStatus: string,
    destinationMessageStatus: string,
    messageObject: Message,
  ): boolean {
    if (
      sourceMessageStatus === MessageStatus.Declared
      && destinationMessageStatus === MessageStatus.Undeclared
      && Utils.isSourceDeclaredTargetUndeclared(messageObject)
    ) {
      return true;
    }
    if (
      sourceMessageStatus === MessageStatus.Declared
      && destinationMessageStatus === MessageStatus.Undeclared
      && Utils.isSourceDeclaredTargetUndeclared(messageObject)
    ) {
      return true;
    }
    if (
      sourceMessageStatus === MessageStatus.Declared
      && destinationMessageStatus === MessageStatus.Declared
      && (Utils.isSourceDeclaredTargetUndeclared(messageObject)
      || Utils.isSourceDeclaredTargetDeclared(messageObject))
    ) {
      return true;
    }
    if (
      sourceMessageStatus === MessageStatus.Declared
      && destinationMessageStatus === MessageStatus.Progressed
      && (Utils.isSourceDeclaredTargetDeclared(messageObject)
      || Utils.isSourceDeclaredTargetProgressed(messageObject))
    ) {
      return true;
    }
    if (
      sourceMessageStatus === MessageStatus.Progressed
      && destinationMessageStatus === MessageStatus.Declared
      && (Utils.isSourceDeclaredTargetDeclared(messageObject)
      || Utils.isSourceProgressedTargetDeclared(messageObject))
    ) {
      return true;
    }
    if (
      sourceMessageStatus === MessageStatus.Progressed
      && destinationMessageStatus === MessageStatus.Progressed
      && (Utils.isSourceProgressedTargetDeclared(messageObject)
      || Utils.isSourceDeclaredTargetProgressed(messageObject)
      || Utils.isSourceDeclaredTargetDeclared(messageObject))
    ) {
      return true;
    }

    return false;
  }

  /**
   * Convert amount to wei's
   * @param amount
   * @return wei amount
   */
  public static convertToWei(amount: string) {
    return web3Utils.toWei(amount.toString());
  }

  /**
   * if present, get connection from the cached pool
   * else create new connection
   * @param endpoint
   * @return web3 connection
   */
  private static getWeb3Connection(endpoint: string): Web3 {
    if (!urlToWeb3ConnectionsMap[endpoint]) {
      urlToWeb3ConnectionsMap[endpoint] = new Web3(endpoint);
    }
    return urlToWeb3ConnectionsMap[endpoint];
  }

}
