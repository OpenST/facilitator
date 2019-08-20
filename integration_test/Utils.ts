import Web3 from 'web3';
import * as web3Utils from 'web3-utils';
import * as fs from 'fs';
import * as path from 'path';
import BigNumber from 'bignumber.js';
import { interacts } from '@openst/mosaic-contracts';
import { EIP20Token } from '@openst/mosaic-contracts/dist/interacts/EIP20Token';
import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import Repositories from '../src/repositories/Repositories';
import Directory from '../src/Directory';
import StakeRequest from '../src/models/StakeRequest';
import { MessageStatus } from '../src/repositories/MessageRepository';
import assert from '../test/test_utils/assert';
import MosaicConfig from '../src/Config/MosaicConfig';
import { default as SrcUtils } from '../src/Utils';
import { Organization } from '@openst/mosaic-contracts/dist/interacts/Organization';
import GraphClient from '../src/subscriptions/GraphClient';
import { OSTComposer } from '@openst/mosaic-contracts/dist/interacts/OSTComposer';

const EthUtils = require('ethereumjs-util');

const mosaicConfig = MosaicConfig.fromFile(path.join(__dirname, 'mosaic.json'));

const ABIDirectoryPath = path.join(__dirname, 'abi');

const auxSubGraphRpc = 'http://127.0.0.1:11000/subgraphs/name/mosaic/auxiliary-1000';

const fetchQuery = 'query ($contractAddress: Bytes!, $messageHash: Bytes!) {\n'
  + 'mintProgresseds(orderBy: uts, orderDirection: asc, first: 1, where:'
  + ' {contractAddress: $contractAddress, _messageHash: $messageHash}) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _staker\n'
  + '    _beneficiary\n'
  + '    _stakeAmount\n'
  + '    _mintedAmount\n'
  + '    _rewardAmount\n'
  + '    _proofProgress\n'
  + '    _unlockSecret\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}'

/**
 * It contains common helper methods to test facilitator.
 */
export default class Utils {
  public originWeb3: Web3;

  public auxiliaryWeb3: Web3;

  private originFunder: string;

  private auxiliaryFunder: string;

  private ostComposer: string;

  private step: number;

  private mintingStatus: boolean = false;

  private mosaicConfig: MosaicConfig;

  private messageHash: string | undefined;

  /**
   * Constructor for utils class for initialization.
   * @param originWeb3 Origin chain web3.
   * @param auxiliaryWeb3 Auxiliary chain web3.
   * @param originFunder Address of origin chain funder address.
   * @param auxiliaryFunder Address of aux chain funder address.
   * @param ostComposer Address of OSTComposer contract at origin chain.
   */
  constructor(
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    originFunder: string,
    auxiliaryFunder: string,
    mosaicConfig: MosaicConfig,
  ) {
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.originFunder = originFunder;
    this.auxiliaryFunder = auxiliaryFunder;
    this.mosaicConfig = mosaicConfig;
    this.ostComposer = this.mosaicConfig.originChain.contractAddresses.ostComposerAddress!;
    this.step = 1;
    this.originWeb3.transactionConfirmationBlocks = 6;
    this.auxiliaryWeb3.transactionConfirmationBlocks = 6;
  }

  /**
   * It returns status of minting.
   * @returns Minting status of an stake.
   */
  public getMintingStatus(): boolean {
    return this.mintingStatus;
  }

  /**
   * It funds ETH on origin chain to beneficiary.
   * @param beneficiary Address of the account who is to be funded.
   * @param amountInETH Amount to be funded in ETH. Default is 3.
   * @returns Receipt of eth funding to beneficiary.
   */
  public async fundETHOnOrigin(beneficiary: string, amountInETH: number = 3): Promise<any> {
    return await this.originWeb3.eth.sendTransaction(
      {
        from: this.originFunder,
        to: beneficiary,
        value: web3Utils.toWei(web3Utils.toBN(amountInETH)),
      },
    );
  }

  /**
   * It funds OSTPrime on origin chain to beneficiary.
   * @param beneficiary Address of the account who is to be funded.
   * @returns Receipt of eth funding to beneficiary.
   */
  public async fundOSTPrimeOnAuxiliary(beneficiary: string) {
    return await this.auxiliaryWeb3.eth.sendTransaction(
      {
        from: this.auxiliaryFunder,
        to: beneficiary,
        value: web3Utils.toWei(web3Utils.toBN(2)),
      },
    );
  }

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
  public async whitelistOriginWorker(worker: string, expirationHeight: number): Promise<any> {
    const organizationContractInstance = await this.getOriginOrganizationInstance();

    const owner = await organizationContractInstance.methods.owner().call();

    const setWorkerRawTx: TransactionObject<void> = await organizationContractInstance.methods.setWorker(
      worker,
      expirationHeight,
    );

    const setWorkerReceipt = await SrcUtils.sendTransaction(
      setWorkerRawTx,
      {
        from: owner,
        gasPrice: '0x174876E800',
      },
      this.originWeb3,
    );

    return setWorkerReceipt;
  }

  public getAuxContractInstance(contractName: string, contractAddress: string) {
    const abi = fs.readFileSync(path.join(ABIDirectoryPath, contractName.concat('.json')), 'utf8');
    return new this.auxiliaryWeb3.eth.Contract(
      JSON.parse(abi),
      contractAddress,
    );
  }

  /**
   * It provide organization contract used in OSTComposer.
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
  public async anchorOrigin(auxChainId: number): Promise<void> {
    console.log('in anchor origin');
    // const organizationInstance = this.getAuxContractInstance('Organization', mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorOrganizationAddress!);
    const organizationInstance = interacts.getOrganization(this.auxiliaryWeb3, mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorOrganizationAddress);

    // const anchorInstance = this.getAuxContractInstance('Anchor', mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorAddress!);

    const anchorInstance = interacts.getAnchor(this.auxiliaryWeb3, mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorAddress);

    const currentBlock = await this.originWeb3.eth.getBlock('latest');

    const owner = await organizationInstance.methods.owner().call();

    const anchorStateRootRawTx: TransactionObject<boolean> = await anchorInstance.methods.anchorStateRoot(
      currentBlock.number,
      currentBlock.stateRoot,
    );

    await SrcUtils.sendTransaction(
      anchorStateRootRawTx,
      {
        from: owner,
        gasPrice: '0x174876E800',
      },
      this.originWeb3,
    );

  }

  /**
   * It provides stake request hash.
   * @param stakeRequest It represents stake request object.
   * @param gateway Gateway address on which request stake is to be done.
   * @param ostComposer OSTComposer contract address.
   * @returns EIP712 compatible stakerequest hash.
   */
  public getStakeRequestHash(stakeRequest: any, gateway: string, ostComposer: any): Buffer | Uint8Array {
    const stakeRequestMethod = 'StakeRequest(uint256 amount,address beneficiary,uint256 gasPrice,uint256 gasLimit,uint256 nonce,address staker,address gateway)';
    const encodedTypeHash = web3Utils.sha3(
      this.originWeb3.eth.abi.encodeParameter('string', stakeRequestMethod),
    );

    const stakeIntentTypeHash = web3Utils.soliditySha3(
      { type: 'bytes32', value: encodedTypeHash },
      { type: 'uint256', value: stakeRequest.amount },
      { type: 'address', value: stakeRequest.beneficiary },
      { type: 'uint256', value: stakeRequest.gasPrice },
      { type: 'uint256', value: stakeRequest.gasLimit },
      { type: 'uint256', value: stakeRequest.nonce },
      { type: 'address', value: stakeRequest.staker },
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
    return Repositories.create(path.join(Directory.getDBFilePath('1000'), 'mosaic_facilitator.db'));
  }

  /**
   * It verifies flow of stake and minting of OSTPrime.
   * @param stakeRequestHash Hash of stake request.
   * @returns `true` if minting of OSTPrime is done.
   */
  public async verifyMinting(stakeRequestHash: string): Promise<boolean> {
    let repos: Repositories;
    repos = await this.getRepositories();

    const stakeRequest: StakeRequest | null = await repos.stakeRequestRepository.get(stakeRequestHash);

    if (stakeRequest !== null) {
      while (!this.messageHash) {
        await new Promise(done => setTimeout(done, 2000));
        const sr = await repos.stakeRequestRepository.get(stakeRequest.stakeRequestHash);
        this.messageHash = sr !== null ? sr.messageHash : undefined;
      }

      const message = await repos.messageRepository.get(this.messageHash);

      switch (this.step) {
        case 1:
          if (message!.sourceStatus === MessageStatus.Declared && message!.targetStatus === MessageStatus.Undeclared) {
            this.step = 2;
          }
          break;

        case 2:
          if (message!.sourceStatus === MessageStatus.Declared && message!.targetStatus === MessageStatus.Declared) {
            this.step = 3;
          }
          break;

        case 3:
          if (message!.sourceStatus === MessageStatus.Progressed && message!.targetStatus === MessageStatus.Progressed) {
            this.mintingStatus = true;
            return true;
          }
          break;
      }
    } else {
      await new Promise(done => setTimeout(done, 2000));
    }
    return false;
  }

  /**
   * It asserts minted balance of beneficiary at auxiliary chain.
   * @param beneficiary Address which received OSTPrime.
   * @param expectedMintedAmount Expected minted amount.
   */
  public async assertMintingBalance(beneficiary: string, expectedMintedAmount: BigNumber): Promise<void> {
    const actualMintedAmount = new BigNumber(await this.auxiliaryWeb3.eth.getBalance(beneficiary));

    assert.strictEqual(
      actualMintedAmount.cmp(expectedMintedAmount),
      0,
      `Expected minted balance is ${expectedMintedAmount} but got ${actualMintedAmount}`,
    );
  }

  /**
   * It verifies the ERCO token transfer.
   * @param receipt Receipt of ERC20 transfer.
   * @param beneficiary Beneficiary of the transfer.
   * @param amount Amount which is transferred to beneficiary.
   */
  public async verifyERC20Transfer(receipt: any, beneficiary: string, amount: number): Promise<void> {
    assert.strictEqual(receipt.status, true, 'Receipt status should be true');

    const simpletokenInstance = this.getSimpleTokenInstance();

    const beneficiaryBalance = await simpletokenInstance.methods.balanceOf(beneficiary).call();

    assert.strictEqual(
      this.originWeb3.utils.toBN(amount).cmpn(Number.parseInt(beneficiaryBalance)),
      0,
      `Expected balance is  ${amount} but got ${beneficiaryBalance}`,
    );
  }

  /**
   * It provides Simple Token contract instance.
   * @returns Simple token object.
   */
  public getSimpleTokenInstance(): EIP20Token {
    const { simpleTokenAddress } = mosaicConfig.originChain.contractAddresses;
    const simpletokenInstance: EIP20Token = interacts.getEIP20Token(this.originWeb3, simpleTokenAddress);
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
   * It verifies the minted amount, beneficiary in graph client.
   * @param auxChainId Auxiliary chain id.
   * @param expectedMintedAmount Expected minted amount.
   */
  public async assertMintProgressedInGraphClient(
    auxChainId: number,
    expectedMintedAmount: BigNumber,
    stakeRequest: any
  ) {

    const graphClient = GraphClient.getClient(
      'http',
      auxSubGraphRpc,
    );

    const variables = {
      contractAddress: mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.ostEIP20CogatewayAddress,
      messageHash: this.messageHash,
    };

    const queryResult = await graphClient.query(fetchQuery, variables);

    const mintProgressed: any = queryResult['data']['mintProgresseds'][0];

    const actualMintedAmount = mintProgressed['_mintedAmount'];
    assert.strictEqual(
      expectedMintedAmount.cmp(actualMintedAmount),
      0,
      `Expected minted amount is ${expectedMintedAmount} but got ${actualMintedAmount}`,
    );

    assert.strictEqual(
      this.messageHash,
      mintProgressed['_messageHash'],
      'Incorrect message hash address',
    );

    assert.strictEqual(
      stakeRequest.beneficiary,
      mintProgressed['_beneficiary'],
      'Incorrect beneficiary address',
    );
  }
}
