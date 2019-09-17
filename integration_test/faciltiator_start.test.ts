import { execSync, spawn, spawnSync } from 'child_process';
import * as path from 'path';
import BigNumber from 'bignumber.js';

import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { EIP20Token } from '@openst/mosaic-contracts/dist/interacts/EIP20Token';
import { Account } from 'web3/eth/accounts';
import { EIP20Gateway } from '@openst/mosaic-contracts/dist/interacts/EIP20Gateway';
import { Organization } from '@openst/mosaic-contracts/dist/interacts/Organization';
import { FacilitatorConfig } from '../src/Config/Config';
import { GatewayType } from '../src/repositories/GatewayRepository';

import Utils from './Utils';
import MosaicConfig from '../src/Config/MosaicConfig';
import StakeRequest from '../src/models/StakeRequest';

import Message from '../src/models/Message';

import {
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../src/repositories/MessageRepository';
import * as Constants from './Constants.json';
import assert from '../test/test_utils/assert';
import AuxiliaryChain from '../src/models/AuxiliaryChain';

const facilitatorInit = path.join(__dirname, 'facilitator_init.sh');
const facilitatorStart = path.join(__dirname, 'facilitator_start.sh');
const facilitatorKill = path.join(__dirname, 'kill_facilitator_process.sh');

describe('facilitator start', async () => {
  const stakeAmount = '130';
  const gasPrice = '10';
  const gasLimit = '4';

  function getStakeRequest(): StakeRequest {
    const stakeRequest = new StakeRequest(
      '',
      new BigNumber(stakeAmount),
      '',
      new BigNumber(gasPrice),
      new BigNumber(gasLimit),
    );

    return stakeRequest;
  }

  let originWeb3: any;
  let auxChainId: number;
  let messageHash: string;
  let generatedStakeRequestHash: string;
  let expectedMessage: Message;
  const mosaicConfigPath = path.join(__dirname, 'mosaic.json');

  const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);

  const ostComposer: string = mosaicConfig.originChain.contractAddresses.ostComposerAddress!;

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
  const stakeRequest = getStakeRequest();

  const reward = stakeRequest.gasPrice!.mul(stakeRequest.gasLimit!);
  const mintedAmount: BigNumber = stakeRequest.amount!.sub(reward);

  before(async () => {
    Utils.setEnvironment(mosaicConfigPath);
  });

  it('facilitator init', async () => {
    spawnSync(facilitatorInit, { stdio: outputOptions, env: process.env });

    auxChainId = Number(Constants.auxChainId);
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
      '',
      '',
    );
    ({ originWeb3 } = utils);

    const originAccounts = await utils.originWeb3.eth.getAccounts();
    const auxiliaryAccounts = await utils.auxiliaryWeb3.eth.getAccounts();
    utils.setOriginFunder(originAccounts[4]);
    utils.setAuxiliaryFunder(auxiliaryAccounts[6]);

    utils.setWorkerPasswordInEnvironment();
    originWorker = facilitatorConfig.chains[facilitatorConfig.originChain].worker;
    auxiliaryWorker = facilitatorConfig.chains[auxChainId].worker;
  });

  it('fund staker', async () => {
    simpleTokenInstance = utils.getSimpleTokenInstance();
    stakerAccount = originWeb3.eth.accounts.create('facilitatortest');
    originWeb3.eth.accounts.wallet.add(stakerAccount);
    stakeRequest.beneficiary = stakerAccount.address;

    const transferRawTx: TransactionObject<boolean> = simpleTokenInstance.methods.transfer(
      stakerAccount.address,
      stakerOSTBalance,
    );

    const transferReceipt = await utils.sendTransaction(
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

  it('funding origin and aux workers', async () => {
    await utils.fundEthOnOrigin(originWorker, new BigNumber(amountTobeFundedOnOrigin));
    await utils.fundOSTPrimeOnAuxiliary(
      auxiliaryWorker,
      new BigNumber(amountTobeFundedOnAuxiliary),
    );

    const transferRawTx: TransactionObject<boolean> = simpleTokenInstance.methods.transfer(
      originWorker,
      workerOSTBalance.toString(),
    );
    const transferReceipt = await utils.sendTransaction(
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

  it('facilitator start', async () => {
    spawn(
      facilitatorStart,
      { stdio: outputOptions, env: process.env },
    );
  });

  it('request stake', async () => {
    const transferRawTx: TransactionObject<boolean> = simpleTokenInstance.methods.approve(
      ostComposer,
      stakeRequest.amount!.toString(10),
    );

    stakeRequest.staker = stakerAccount.address;
    await utils.sendTransaction(
      transferRawTx,
      {
        from: stakeRequest.staker,
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );

    stakeRequest.gateway = mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.ostEIP20GatewayAddress;
    const stakerNonce = await utils.getGatewayNonce(stakeRequest.staker);
    stakeRequest.nonce = new BigNumber(stakerNonce);

    const ostComposerInstance = utils.getOSTComposerInstance();
    const requestStakeRawTx: TransactionObject<string> = ostComposerInstance.methods.requestStake(
      stakeRequest.amount!.toString(10),
      stakeRequest.beneficiary!,
      stakeRequest.gasPrice!.toString(10),
      stakeRequest.gasLimit!.toString(10),
      stakerNonce,
      stakeRequest.gateway!,
    );

    const receipt = await utils.sendTransaction(
      requestStakeRawTx,
      {
        from: stakeRequest.staker,
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );

    assert.strictEqual(
      receipt.status,
      true,
      'stake request receipt status should be true',
    );

    generatedStakeRequestHash = utils.getStakeRequestHash(
      stakeRequest,
      stakeRequest.gateway!,
      ostComposer,
    );

    const stakeRequestHash = await ostComposerInstance.methods.stakeRequestHashes(
      stakeRequest.staker,
      stakeRequest.gateway!,
    ).call();

    assert.strictEqual(
      generatedStakeRequestHash,
      stakeRequestHash,
      'Incorrect stake request hash',
    );

    let stakeRequestInterval: NodeJS.Timeout;
    const stakeRequestPromise = new Promise(((resolve, reject) => {
      const endTime = utils.getEndTime(testDuration);
      stakeRequestInterval = setInterval(async () => {
        const stakeRequestDb: StakeRequest | null = await utils.getStakeRequest(
          generatedStakeRequestHash,
        );

        if (stakeRequestDb != null) {
          utils.assertStakeRequests(stakeRequestDb, stakeRequest);
          resolve();
        }

        const currentTime = process.hrtime()[0];

        if (currentTime >= endTime) {
          return reject(
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

    stakeRequest.stakerProxy = await ostComposerInstance.methods.stakerProxies(
      stakeRequest.staker,
    ).call();

    const requestStakePromise = new Promise(((resolve, reject) => {
      const endTime = utils.getEndTime(testDuration);
      requestStakeInterval = setInterval(async (): Promise<void> => {
        const stakeRequestDb: StakeRequest | null = await utils.getStakeRequest(
          generatedStakeRequestHash,
        );

        if (stakeRequestDb!.messageHash) {
          messageHash = stakeRequestDb!.messageHash;
          expectedMessage = new Message(
            messageHash,
            MessageType.Stake,
            stakeRequest.gateway,
            MessageStatus.Undeclared,
            MessageStatus.Undeclared,
            stakeRequest.gasPrice,
            stakeRequest.gasLimit,
            stakeRequest.nonce,
            stakeRequest.stakerProxy,
            MessageDirection.OriginToAuxiliary,
            new BigNumber(0),
            '',
          );
          const messageInDb = await utils.getMessageFromDB(messageHash);

          const gateway: EIP20Gateway = utils.getEIP20GatewayInstance();
          const message = await gateway.methods.messages(messageHash.toString()).call();
          const gatewayMessageStatus = parseInt(
            await gateway.methods.getOutboxMessageStatus(messageHash).call(),
            10,
          );

          const coGatewayMessageStatus = parseInt(
            await gateway.methods.getOutboxMessageStatus(messageHash).call(),
            10,
          );

          if (
            messageInDb!.sourceStatus === MessageStatus.Undeclared
            && messageInDb!.sourceStatus === MessageStatus.Undeclared
          ) {
            expectedMessage.hashLock = message.hashLock;

            utils.assertMessages(messageInDb!, expectedMessage);
          }

          if (
            messageInDb!.sourceStatus === MessageStatus.Declared
            && messageInDb!.targetStatus === MessageStatus.Undeclared
          ) {
            expectedMessage.hashLock = message.hashLock;
            expectedMessage.sourceStatus = gatewayMessageStatus === 1 ? MessageStatus.Declared : MessageStatus.Undeclared;
            expectedMessage.targetStatus = coGatewayMessageStatus === 1 ? MessageStatus.Undeclared : MessageStatus.Undeclared;
            utils.assertMessages(messageInDb!, expectedMessage);

            resolve();
          }
        }

        const currentTime = process.hrtime()[0];

        if (currentTime >= endTime) {
          return reject(
            new Error(
              'Assertion for messages table while request staking failed as response was not received'
              + ` within ${testDuration} mins`,
            ),
          );
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

  it('verify anchoring', async () => {
    anchoredBlockNumber = await utils.anchorOrigin(auxChainId);

    let verifyAnchorInterval: NodeJS.Timeout;
    const verifyAnchorPromise = new Promise(((resolve, reject) => {
      const endTime = utils.getEndTime(testDuration);
      verifyAnchorInterval = setInterval(async (): Promise<void> => {
        const auxiliaryChain: AuxiliaryChain | null = await utils.getAuxiliaryChainFromDb(
          auxChainId,
        );

        if (auxiliaryChain!.lastOriginBlockHeight!.cmp(anchoredBlockNumber) === 0) {
          const expectedAuxiliaryChain = utils.getAuxiliaryChainStub(
            new BigNumber(anchoredBlockNumber),
            auxiliaryChain!.lastAuxiliaryBlockHeight!,
          );

          utils.assertAuxiliaryChain(auxiliaryChain!, expectedAuxiliaryChain);
          resolve();
        }

        const currentTime = process.hrtime()[0];

        if (currentTime >= endTime) {
          return reject(
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

  it('target status declared and source status declared', async () => {
    let declarePromiseInterval: NodeJS.Timeout;

    const declarePromise = new Promise(((resolve, reject) => {
      const endTime = utils.getEndTime(testDuration);
      declarePromiseInterval = setInterval(async (): Promise<void> => {
        const coGateway = utils.getEIP20CoGatewayInstance();

        const messageStatus = parseInt(
          await coGateway.methods.getInboxMessageStatus(messageHash).call(),
          10,
        );
        const messageInGateway = await coGateway.methods.messages(messageHash).call();
        const messageInDb = await utils.getMessageFromDB(messageHash);

        if (
          messageInDb!.targetStatus === MessageStatus.Declared
          && messageInDb!.sourceStatus === MessageStatus.Declared
        ) {
          expectedMessage.targetStatus = messageStatus === 1 ? MessageStatus.Declared : MessageStatus.Undeclared;

          expectedMessage = utils.getMessageStub(messageInGateway, messageInDb!);

          utils.assertMessages(messageInDb!, expectedMessage);

          const eip20GatewayAddress = mosaicConfig.auxiliaryChains[facilitatorConfig.auxChainId].contractAddresses.origin.ostEIP20GatewayAddress!;
          const gateways = await utils.getGateway(eip20GatewayAddress);

          const eip20GatewayInstance = utils.getEIP20GatewayInstance();
          const bounty = await eip20GatewayInstance.methods.bounty().call();
          const activation = await eip20GatewayInstance.methods.activated().call();
          const expectedGateway = utils.getGatewayStub(
            bounty,
            activation,
            GatewayType.Origin,
            new BigNumber(anchoredBlockNumber),
          );

          utils.assertGateway(gateways!, expectedGateway);
          resolve();
        }

        const currentTime = process.hrtime()[0];
        if (currentTime >= endTime) {
          return reject(
            new Error(
              'Assertion for auxiliary chains/messages table failed while anchoring'
              + ` as response was not received within ${testDuration} mins`,
            ),
          );
        }
      },
      interval);
    }));

    await declarePromise.then((): void => {
      clearInterval(declarePromiseInterval);
    }).catch((err: Error): Error => {
      clearInterval(declarePromiseInterval);
      throw err;
    });
  });

  it('source status and target status is progressed', async () => {
    let progressPromiseInterval: NodeJS.Timeout;
    const progressPromise = new Promise(((resolve, reject) => {
      const endTime = utils.getEndTime(testDuration);
      progressPromiseInterval = setInterval(async (): Promise<void> => {
        const eip20Gateway = utils.getEIP20GatewayInstance();
        const eip20Cogateway = utils.getEIP20CoGatewayInstance();
        const eip20GatewayMessageStatus = parseInt(await eip20Gateway.methods.getOutboxMessageStatus(
          messageHash,
        ).call(),
        10);

        const eip20CoGatewayMessageStatus = parseInt(await eip20Cogateway.methods.getInboxMessageStatus(
          messageHash,
        ).call(),
        10);

        const eip20GatewayMessage = await eip20Gateway.methods.messages(messageHash).call();
        const messageInDb = await utils.getMessageFromDB(messageHash);

        if (
          messageInDb!.sourceStatus === MessageStatus.Progressed
          && messageInDb!.targetStatus === MessageStatus.Progressed
        ) {
          expectedMessage = utils.getMessageStub(eip20GatewayMessage, messageInDb!);
          await utils.assertMintingBalance(stakerAccount.address, mintedAmount);
          expectedMessage.sourceStatus = eip20GatewayMessageStatus === 2 ? MessageStatus.Progressed : MessageStatus.Undeclared;
          expectedMessage.targetStatus = eip20CoGatewayMessageStatus === 2 ? MessageStatus.Progressed : MessageStatus.Undeclared;
          utils.assertMessages(messageInDb!, expectedMessage);
          clearInterval(progressPromiseInterval);
          resolve();
        }

        const currentTime = process.hrtime()[0];

        if (currentTime >= endTime) {
          return reject(
            new Error(
              'Assertion for messages table while progressing message failed'
              + ` as response was not received within ${testDuration} mins`,
            ),
          );
        }
      },
      interval);
    }));

    await progressPromise.then((): void => {
      clearInterval(progressPromiseInterval);
    }).catch((err: Error): Error => {
      clearInterval(progressPromiseInterval);
      throw err;
    });
  });

  after(async () => {
    execSync(facilitatorKill, { stdio: outputOptions, env: process.env });
  });
});
