import { execSync, spawn, spawnSync } from 'child_process';
import * as path from 'path';
import BigNumber from 'bignumber.js';
import fs from 'fs-extra';
import Web3 from 'web3';

import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { EIP20Token } from '@openst/mosaic-contracts/dist/interacts/EIP20Token';
import { Account } from 'web3-eth-accounts';
import { EIP20Gateway } from '@openst/mosaic-contracts/dist/interacts/EIP20Gateway';
import { EIP20CoGateway } from '@openst/mosaic-contracts/dist/interacts/EIP20CoGateway';
import { Organization } from '@openst/mosaic-contracts/dist/interacts/Organization';
import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import { FacilitatorConfig } from '../src/Config/Config';

import Utils from './Utils';
import MessageTransferRequest from '../src/models/MessageTransferRequest';

import Message from '../src/models/Message';

import {
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../src/repositories/MessageRepository';
import * as Constants from './Constants.json';
import assert from '../test/test_utils/assert';
import AuxiliaryChain from '../src/models/AuxiliaryChain';
import Directory from '../src/Directory';

const facilitatorInit = path.join(__dirname, 'facilitator_init.sh');
const facilitatorStart = path.join(__dirname, 'facilitator_start.sh');
const facilitatorKill = path.join(__dirname, 'kill_facilitator_process.sh');

describe('facilitator start', async (): Promise<void> => {
  const stakeAmount = '130';
  const gasPrice = '10';
  const gasLimit = '4';
  let originWeb3: Web3;
  let auxiliaryWeb3: Web3;
  let auxChainId: number;
  let messageHash: string | undefined;
  let generatedStakeRequestHash: string;
  let expectedMessage: Message;
  const mosaicConfigPath = path.join(__dirname, 'mosaic.json');

  const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);

  const stakePool: string = mosaicConfig.originChain.contractAddresses.stakePoolAddress;

  const outputOptions = [process.stdout, process.stderr];

  let facilitatorConfig: FacilitatorConfig;
  let originWorker: string;
  let auxiliaryWorker: string;
  let utils: Utils;
  let simpleTokenInstance: EIP20Token;
  let stakerAccount: Account;
  const stakerOSTBalance = '20000';
  const workerOSTBalance = new BigNumber(500);
  const amountTobeFundedOnOrigin = new BigNumber(1);
  const amountTobeFundedOnAuxiliary = new BigNumber(1);
  const testDuration = 3;
  const interval = 3000;
  const workerExpirationHeight = '100000000000';
  let anchoredBlockNumber: number;
  let messageTransferRequest: MessageTransferRequest;

  before(async () => {
    Utils.setEnvironment(mosaicConfigPath);
  });

  it('facilitator init', async (): Promise<void> => {
    auxChainId = Number(Constants.auxChainId);
    // Removing facilitator config.
    fs.removeSync(Directory.getFacilitatorConfigPath(auxChainId.toString()));

    spawnSync(facilitatorInit, { stdio: outputOptions, env: process.env });
    facilitatorConfig = FacilitatorConfig.fromChain(auxChainId);

    assert.strictEqual(
      facilitatorConfig.auxChainId,
      Number(Constants.auxChainId),
      'Invalid aux chain id',
    );

    assert.strictEqual(
      facilitatorConfig.originChain,
      Constants.originChain,
      'Invalid origin chain id',
    );

    assert.strictEqual(
      facilitatorConfig.chains[facilitatorConfig.originChain].nodeRpc,
      Constants.originRpc,
      'Invalid origin rpc',
    );

    assert.strictEqual(
      facilitatorConfig.chains[facilitatorConfig.auxChainId].nodeRpc,
      Constants.auxiliaryRpc,
      'Invalid auxiliary rpc',
    );

    assert.strictEqual(
      facilitatorConfig.chains[facilitatorConfig.auxChainId].subGraphRpc,
      Constants.auxiliaryGraphRpc,
      'Invalid auxiliary graph rpc',
    );

    assert.strictEqual(
      facilitatorConfig.chains[facilitatorConfig.originChain].subGraphRpc,
      Constants.originGraphRpc,
      'Invalid auxiliary graph rpc',
    );

    utils = new Utils(
      mosaicConfig,
      facilitatorConfig,
      Number(Constants.auxChainId),
    );
    ({ originWeb3, auxiliaryWeb3 } = utils);

    const originAccounts = await originWeb3.eth.getAccounts();
    const auxiliaryAccounts = await auxiliaryWeb3.eth.getAccounts();
    utils.setOriginFunder(originAccounts[4]);
    utils.setAuxiliaryFunder(auxiliaryAccounts[6]);

    utils.setWorkerPasswordInEnvironment();
    originWorker = facilitatorConfig.chains[facilitatorConfig.originChain].worker;
    auxiliaryWorker = facilitatorConfig.chains[auxChainId].worker;
  });

  it('fund staker', async (): Promise<void> => {
    simpleTokenInstance = utils.getSimpleTokenInstance();
    stakerAccount = originWeb3.eth.accounts.create('facilitatortest');
    originWeb3.eth.accounts.wallet.add(stakerAccount);

    const transferRawTx: TransactionObject<boolean> = simpleTokenInstance.methods.transfer(
      stakerAccount.address,
      stakerOSTBalance,
    );

    const transferReceipt = await Utils.sendTransaction(
      transferRawTx,
      {
        from: utils.originFunder,
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );
    await utils.verifyOSTTransfer(
      transferReceipt,
      stakerAccount.address,
      new BigNumber(stakerOSTBalance),
    );

    await utils.fundEthOnOrigin(
      stakerAccount.address,
      new BigNumber(2),
    );
  });

  it('funding origin and aux workers', async (): Promise<void> => {
    await utils.fundEthOnOrigin(originWorker, new BigNumber(amountTobeFundedOnOrigin));
    await utils.fundOSTPrimeOnAuxiliary(
      auxiliaryWorker,
      new BigNumber(amountTobeFundedOnAuxiliary),
    );

    const transferRawTx: TransactionObject<boolean> = simpleTokenInstance.methods.transfer(
      originWorker,
      workerOSTBalance.toString(),
    );
    const transferReceipt = await Utils.sendTransaction(
      transferRawTx,
      {
        from: utils.originFunder,
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );
    await utils.verifyOSTTransfer(transferReceipt, originWorker, new BigNumber(workerOSTBalance));
  });

  it('whitelist origin worker', async () => {
    const whitelistWorkerReceipt = await utils.whitelistOriginWorker(
      originWorker,
      workerExpirationHeight,
    );

    assert.strictEqual(
      whitelistWorkerReceipt.status,
      true,
    );

    const organizationInstance: Organization = await utils.getOriginOrganizationInstance();
    const actualExpirationHeight = new BigNumber(await organizationInstance.methods.workers(
      originWorker,
    ).call());

    assert.strictEqual(
      await organizationInstance.methods.isWorker(originWorker).call(),
      true,
    );

    assert.strictEqual(
      actualExpirationHeight.cmp(workerExpirationHeight),
      0,
      `Expected worker expiration height is ${workerExpirationHeight} but`
              + `got ${actualExpirationHeight}`,
    );
  });

  it('facilitator start', async (): Promise<void> => {
    spawn(
      facilitatorStart,
      { stdio: outputOptions, env: process.env },
    );
    // Note: Ensuring that facilitator starts and then we do stake requests.
    await new Promise(done => setTimeout(done, 20000));
  });

  it('request stake', async (): Promise<void> => {
    messageTransferRequest = new MessageTransferRequest(
      '',
      MessageType.Stake,
      new BigNumber(0), // It will be updated after stake request is done.
      new BigNumber(stakeAmount),
      auxiliaryWeb3.eth.accounts.create('beneficiary').address,
      new BigNumber(gasPrice),
      new BigNumber(gasLimit),
      new BigNumber(1),
      mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.eip20GatewayAddress,
      stakerAccount.address,
    );

    generatedStakeRequestHash = utils.getStakeRequestHash(
      messageTransferRequest,
      messageTransferRequest.gateway!,
      stakePool,
    );

    const transferRawTx: TransactionObject<boolean> = simpleTokenInstance.methods.approve(
      stakePool,
      messageTransferRequest.amount!.toString(10),
    );

    messageTransferRequest.sender = stakerAccount.address;
    await Utils.sendTransaction(
      transferRawTx,
      {
        from: messageTransferRequest.sender,
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );

    const ostComposerInstance = utils.getStakePoolInstance();
    const requestStakeRawTx: TransactionObject<string> = ostComposerInstance.methods.requestStake(
      messageTransferRequest.amount!.toString(10),
      messageTransferRequest.beneficiary!,
      messageTransferRequest.gasPrice!.toString(10),
      messageTransferRequest.gasLimit!.toString(10),
      messageTransferRequest.nonce!.toString(10),
      messageTransferRequest.gateway!,
    );

    const receipt = await Utils.sendTransaction(
      requestStakeRawTx,
      {
        from: messageTransferRequest.sender,
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );

    messageTransferRequest.blockNumber = new BigNumber(receipt.blockNumber);

    assert.strictEqual(
      receipt.status,
      true,
      'stake request receipt status should be true',
    );

    const stakeRequestHash = await ostComposerInstance.methods.stakeRequestHashes(
      messageTransferRequest.sender,
      messageTransferRequest.gateway!,
    ).call();

    assert.strictEqual(
      generatedStakeRequestHash,
      stakeRequestHash,
      'Incorrect stake request hash',
    );

    let stakeRequestInterval: NodeJS.Timeout;
    const stakeRequestPromise = new Promise(((resolve, reject) => {
      const endTime = Utils.getEndTime(testDuration);
      stakeRequestInterval = setInterval(async () => {
        const messageTransferRequestDb: MessageTransferRequest | null = await
        utils.getMessageTransferRequest(
          generatedStakeRequestHash,
        );

        if (messageTransferRequestDb != null) {
          try {
            Utils.assertStakeRequests(messageTransferRequestDb, messageTransferRequest);
          } catch (e) {
            reject(e);
          }
          resolve();
        }

        const currentTime = process.hrtime()[0];

        if (currentTime >= endTime) {
          reject(
            new Error(
              'Assertion for stake requests table failed as response was not received'
              + ` within ${testDuration} mins`,
            ),
          );
        }
      },
      interval);
    }));

    await stakeRequestPromise.then((): void => {
      clearInterval(stakeRequestInterval);
    }).catch((err: Error): Error => {
      clearInterval(stakeRequestInterval);
      throw err;
    });

    let requestStakeInterval: NodeJS.Timeout;

    messageTransferRequest.senderProxy = await ostComposerInstance.methods.stakerProxies(
      messageTransferRequest.sender,
    ).call();

    const requestStakePromise = new Promise(((resolve, reject) => {
      const endTime = Utils.getEndTime(testDuration);
      requestStakeInterval = setInterval(async (): Promise<void> => {
        const stakeRequestDb: MessageTransferRequest | null = await utils.getMessageTransferRequest(
          generatedStakeRequestHash,
        );

        if (stakeRequestDb!.messageHash) {
          ({ messageHash } = stakeRequestDb!);
          expectedMessage = new Message(
            messageHash!,
            MessageType.Stake,
            messageTransferRequest.gateway,
            MessageStatus.Undeclared,
            MessageStatus.Undeclared,
            messageTransferRequest.gasPrice,
            messageTransferRequest.gasLimit,
            messageTransferRequest.nonce,
            messageTransferRequest.senderProxy,
            MessageDirection.OriginToAuxiliary,
            new BigNumber(0),
            '',
          );
          const messageInDb = await utils.getMessageFromDB(messageHash);

          const gateway: EIP20Gateway = utils.getEIP20GatewayInstance();
          const coGateway: EIP20CoGateway = utils.getEIP20CoGatewayInstance();
          const message = await gateway.methods.messages(messageHash!.toString()).call();
          const eip20GatewayMessageStatus = Utils.getEnumValue(
            parseInt(
              await gateway.methods.getOutboxMessageStatus(messageHash!).call(),
              10,
            ),
          );

          const eip20CoGatewayMessageStatus = Utils.getEnumValue(
            parseInt(
              await coGateway.methods.getInboxMessageStatus(messageHash!).call(),
              10,
            ),
          );
          try {
            if (
              eip20GatewayMessageStatus === MessageStatus.Undeclared
              && eip20CoGatewayMessageStatus === MessageStatus.Undeclared
              && Utils.isSourceUndeclaredTargetUndeclared(messageInDb!)
            ) {
              Utils.assertMessages(messageInDb!, expectedMessage);
            } else if (
              eip20GatewayMessageStatus === MessageStatus.Declared
              && eip20CoGatewayMessageStatus === MessageStatus.Undeclared
            ) {
              if (Utils.isSourceUndeclaredTargetUndeclared(messageInDb!)) {
                Utils.assertMessages(messageInDb!, expectedMessage);
              } else {
                expectedMessage.hashLock = message.hashLock;
                Utils.assertMessages(messageInDb!, expectedMessage);
                resolve();
              }
            } else {
              throw new Error(
                `Message status for source in db is ${messageInDb!.sourceStatus} but in `
                + `eip20gateway is ${eip20GatewayMessageStatus} and Message status for target in db is `
                + `${messageInDb!.targetStatus} but got ${eip20CoGatewayMessageStatus}`,
              );
            }
          } catch (e) {
            reject(e);
          }
          const currentTime = process.hrtime()[0];

          if (currentTime >= endTime) {
            reject(
              new Error(
                'Assertion for messages table while request staking failed as response was not received'
                + ` within ${testDuration} mins`,
              ),
            );
          }
        }
      },
      interval);
    }));

    await requestStakePromise.then((): void => {
      clearInterval(requestStakeInterval);
    }).catch((err: Error): Error => {
      clearInterval(requestStakeInterval);
      throw err;
    });
  });

  it('verify anchoring', async (): Promise<void> => {
    anchoredBlockNumber = await utils.anchorOrigin(auxChainId);

    let verifyAnchorInterval: NodeJS.Timeout;
    const verifyAnchorPromise = new Promise(((resolve, reject) => {
      const endTime = Utils.getEndTime(testDuration);
      verifyAnchorInterval = setInterval(async (): Promise<void> => {
        const auxiliaryChain: AuxiliaryChain | null = await utils.getAuxiliaryChainFromDb(
          auxChainId,
        );

        if (auxiliaryChain!.lastOriginBlockHeight!.cmp(anchoredBlockNumber) === 0) {
          const expectedAuxiliaryChain = utils.getAuxiliaryChainStub(
            new BigNumber(anchoredBlockNumber),
            auxiliaryChain!.lastAuxiliaryBlockHeight!,
          );
          try {
            Utils.assertAuxiliaryChain(auxiliaryChain!, expectedAuxiliaryChain);
          } catch (e) {
            reject(e);
          }
          resolve();
        }

        const currentTime = process.hrtime()[0];

        if (currentTime >= endTime) {
          reject(
            new Error(
              'Assertion for auxiliary chains table while anchoring failed as'
              + ` response was not received within ${testDuration} mins`,
            ),
          );
        }
      },
      interval);
    }));

    await verifyAnchorPromise.then((): void => {
      clearInterval(verifyAnchorInterval);
    }).catch((err: Error): Error => {
      clearInterval(verifyAnchorInterval);
      throw err;
    });
  });

  it('verify progress minting', async (): Promise<void> => {
    let progressMintingInterval: NodeJS.Timeout;

    const progressMinting = new Promise(((resolve, reject) => {
      const endTime = Utils.getEndTime(testDuration * 2);
      progressMintingInterval = setInterval(async (): Promise<void> => {
        const eip20CoGateway = utils.getEIP20CoGatewayInstance();

        const eip20CoGatewayMessageStatus = Utils.getEnumValue(parseInt(
          await eip20CoGateway.methods.getInboxMessageStatus(
            messageHash!,
          ).call(),
          10,
        ));

        const eip20Gateway = utils.getEIP20GatewayInstance();
        const eip20GatewayMessageStatus = Utils.getEnumValue(parseInt(
          await eip20Gateway.methods.getOutboxMessageStatus(
            messageHash!,
          ).call(),
          10,
        ));

        const messageInGateway = await eip20Gateway.methods.messages(messageHash!).call();

        const messageInDb = await utils.getMessageFromDB(messageHash);

        expectedMessage = Utils.getMessageStub(messageInGateway, expectedMessage!);
        try {
          if (Utils.isMessageStatusValid(
            eip20GatewayMessageStatus,
            eip20CoGatewayMessageStatus,
            messageInDb!,
          )) {
            Utils.assertMessages(messageInDb!, expectedMessage);
          } else if (
            eip20GatewayMessageStatus === MessageStatus.Progressed
            && eip20CoGatewayMessageStatus === MessageStatus.Progressed
            && Utils.isSourceProgressedTargetProgressed(messageInDb!)
          ) {
            Utils.assertMessages(messageInDb!, expectedMessage);
            const reward = messageTransferRequest.gasPrice!.mul(messageTransferRequest.gasLimit!);
            const mintedAmount: BigNumber = messageTransferRequest.amount!.sub(reward);
            await utils.assertMintingBalance(messageTransferRequest.beneficiary!, mintedAmount);
            resolve();
          } else {
            throw new Error(
              `Message status for source in db is ${messageInDb!.sourceStatus} but in `
              + `eip20gateway is ${eip20GatewayMessageStatus} and Message status for target in db is `
              + `${messageInDb!.targetStatus} but got ${eip20CoGatewayMessageStatus}`,
            );
          }
        } catch (e) {
          reject(e);
        }

        const currentTime = process.hrtime()[0];
        if (currentTime >= endTime) {
          reject(
            new Error(
              'Time out while verifying progress minting of message. Source status at db is'
              + `${messageInDb!.sourceStatus} and Target status at db is ${messageInDb!.targetStatus}`
              + `EIP20Gateway status is ${eip20GatewayMessageStatus} and EIP20CoGateway status is`
              + `${eip20CoGatewayMessageStatus}`,
            ),
          );
        }
      },
      interval);
    }));

    await progressMinting.then((): void => {
      clearInterval(progressMintingInterval);
    }).catch((err: Error): Error => {
      clearInterval(progressMintingInterval);
      throw err;
    });
  });

  after(async (): Promise<void> => {
    execSync(facilitatorKill, { stdio: outputOptions, env: process.env });
    fs.removeSync(Directory.getFacilitatorConfigPath(auxChainId.toString()));
  });
});
