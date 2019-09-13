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
  let originWeb3: any;
  let auxChainId: number;
  let messageHash: string;
  let generatedStakeRequestHash: string;
  let expectedMessage: Message;
  const mosaicConfigPath = path.join(__dirname, 'mosaic.json');

  const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);

  const ostComposer: string | undefined = mosaicConfig.originChain.contractAddresses.ostComposerAddress!;

  const outputOptions = [process.stdout, process.stderr];

  let facilitatorConfig: FacilitatorConfig;
  let originWorker: string;
  let auxiliaryWorker: string;
  let utils: Utils;
  let simpleTokenInstance: EIP20Token;
  let stakerAccount: Account;
  const { stakerOSTBalance } = Constants;
  let anchoredBlockNumber: number;
  const stakeRequest = new StakeRequest(
    '',
    new BigNumber(Constants.stakeAmount),
    '',
    new BigNumber(Constants.gasPrice),
    new BigNumber(Constants.gasLimit),
  );

  const reward = stakeRequest!.gasPrice!.mul(stakeRequest.gasLimit!);
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
    );
    originWeb3 = utils.originWeb3;
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
    await utils.verifyOSTTransfer(transferReceipt, stakerAccount.address, Number(stakerOSTBalance));

    await utils.fundEthOnOrigin(stakerAccount.address);
  });

  it('funding origin and aux workers', async () => {
    await utils.fundEthOnOrigin(originWorker);
    await utils.fundOSTPrimeOnAuxiliary(auxiliaryWorker);

    const { workerOSTBalance } = Constants;

    const transferRawTx: TransactionObject<boolean> = simpleTokenInstance.methods.transfer(
      originWorker,
      workerOSTBalance,
    );
    const transferReceipt = await utils.sendTransaction(
      transferRawTx,
      {
        from: utils.originFunder,
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );
    await utils.verifyOSTTransfer(transferReceipt, originWorker, Number(workerOSTBalance));
  });

  it('whitelist origin worker', async () => {
    const whitelistWorkerReceipt = await utils.whitelistOriginWorker(
      originWorker,
      Number(Constants.workerExpirationHeight),
    );

    assert.strictEqual(
      whitelistWorkerReceipt.status,
      true,
    );

    const organizationInstance: Organization = await utils.getOriginOrganizationInstance();
    const workerExpirationHeight = new BigNumber(await organizationInstance.methods.workers(
      originWorker,
    ).call());

    assert.strictEqual(
      await organizationInstance.methods.isWorker(originWorker).call(),
      true,
    );

    assert.strictEqual(
      workerExpirationHeight.cmp(Constants.workerExpirationHeight),
      0,
      `Expected worker expiration height is ${Constants.workerExpirationHeight} but`
              + `got ${workerExpirationHeight}`,
    );
  });

  it('facilitator start', async () => {
    spawn(
      facilitatorStart,
      { stdio: outputOptions, env: process.env },
    );
  });

  it('request stake', async () => {
    const endTime = utils.getEndTime(Constants.testDuration);

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
      stakeRequest!.gateway!,
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
      stakeRequest!,
      stakeRequest!.gateway!,
      ostComposer,
    );

    const stakeRequestHash = await ostComposerInstance.methods.stakeRequestHashes(
      stakeRequest.staker,
      stakeRequest!.gateway!,
    ).call();

    assert.strictEqual(
      generatedStakeRequestHash,
      stakeRequestHash,
      'Incorrect stake request hash',
    );

    let stakeRequestInterval: NodeJS.Timeout;
    const stakeRequestPromise = new Promise(((resolve, reject) => {
      stakeRequestInterval = setInterval(async () => {
        const stakeRequestDb: StakeRequest | null = await utils.getStakeRequest(
          generatedStakeRequestHash,
        );

        if (stakeRequestDb != null) {
          utils.assertStakeRequests(stakeRequestDb!, stakeRequest!);
          resolve();
        }

        const currentTime = process.hrtime()[0];

        if (currentTime >= endTime) {
          return reject(new Error(`Test was not completed within ${Constants.testDuration} mins`));
        }
      },
      Constants.interval);
    }));

    await stakeRequestPromise.then(() => {
      clearInterval(stakeRequestInterval);
    }).catch((err) => {
      clearInterval(stakeRequestInterval);
      throw err;
    });

    let requestStakeInterval: NodeJS.Timeout;

    stakeRequest.stakerProxy = await ostComposerInstance.methods.stakerProxies(
      stakeRequest.staker,
    ).call();

    const requestStakePromise = new Promise(((resolve, reject) => {
      requestStakeInterval = setInterval(async () => {
        const stakeRequestDb: StakeRequest | null = await utils.getStakeRequest(
          generatedStakeRequestHash,
        );

        if (stakeRequestDb!.messageHash) {
          messageHash = stakeRequestDb!.messageHash!;
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
          );

          const coGatewayMessageStatus = parseInt(
            await gateway.methods.getOutboxMessageStatus(messageHash).call(),
          );

          if (
            messageInDb!.sourceStatus === MessageStatus.Undeclared
            && messageInDb!.sourceStatus === MessageStatus.Undeclared
          ) {
            expectedMessage.hashLock = Utils.ZERO_BYTES32;

            utils.assertMessages(messageInDb!, expectedMessage);
          }

          if (
            messageInDb!.sourceStatus === MessageStatus.Declared
            && messageInDb!.targetStatus === MessageStatus.Undeclared
          ) {
            expectedMessage.hashLock = message.hashLock;
            expectedMessage.sourceStatus = gatewayMessageStatus === 1 ? MessageStatus.Declared : MessageStatus.Undeclared;
            expectedMessage.targetStatus = coGatewayMessageStatus === 1 ? MessageStatus.Undeclared : MessageStatus.Undeclared;
            utils.assertMessages(messageInDb!, expectedMessage!);

            resolve();
          }
        }

        const currentTime = process.hrtime()[0];

        if (currentTime >= endTime) {
          return reject(new Error(`Test was not completed within ${Constants.testDuration} mins`));
        }
      },
      Constants.interval);
    }));

    await requestStakePromise.then(() => {
      clearInterval(requestStakeInterval);
    }).catch((err) => {
      clearInterval(requestStakeInterval);
      throw err;
    });
  });

  it('verify anchoring', async () => {
    const endTime = utils.getEndTime(Constants.testDuration);
    anchoredBlockNumber = await utils.anchorOrigin(auxChainId);

    let verifyAnchorInterval: NodeJS.Timeout;
    const verifyAnchorPromise = new Promise(((resolve, reject) => {
      verifyAnchorInterval = setInterval(async () => {
        const auxiliaryChain: AuxiliaryChain | null = await utils.getAuxiliaryChainFromDb(
          auxChainId,
        );

        if (auxiliaryChain!.lastOriginBlockHeight!.cmp(anchoredBlockNumber) === 0) {
          const expectedAuxiliaryChain = utils.getAuxiliaryChainStub(
            new BigNumber(anchoredBlockNumber),
            auxiliaryChain!.lastAuxiliaryBlockHeight!,
          );

          utils.assertAuxiliaryChain(auxiliaryChain!, expectedAuxiliaryChain!);
          resolve();
        }

        const currentTime = process.hrtime()[0];

        if (currentTime >= endTime) {
          return reject(new Error(`Test was not completed within ${Constants.testDuration} mins`));
        }
      },
      Constants.interval);
    }));

    await verifyAnchorPromise.then(() => {
      clearInterval(verifyAnchorInterval);
    }).catch((err) => {
      clearInterval(verifyAnchorInterval);
      throw err;
    });
  });

  it('target status declared and source status declared', async () => {
    const endTime = utils.getEndTime(Constants.testDuration);

    let declarePromiseInterval: NodeJS.Timeout;
    const declarePromise = new Promise(((resolve, reject) => {
      declarePromiseInterval = setInterval(async () => {
        const coGateway = utils.getEIP20CoGatewayInstance();

        const messageStatus = parseInt(
          await coGateway.methods.getInboxMessageStatus(
            messageHash,
          ).call(),
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
          return reject(new Error(`Test was not completed within ${Constants.testDuration} mins`));
        }
      },
      Constants.interval);
    }));

    await declarePromise.then(() => {
      clearInterval(declarePromiseInterval);
    }).catch((err) => {
      clearInterval(declarePromiseInterval);
      throw err;
    });
  });

  it('source status and target status is progressed', async () => {
    const endTime = utils.getEndTime(Constants.testDuration);

    let progressPromiseInterval: NodeJS.Timeout;
    const progressPromise = new Promise(((resolve, reject) => {
      progressPromiseInterval = setInterval(async () => {
        const eip20Gateway = utils.getEIP20GatewayInstance();
        const eip20Cogateway = utils.getEIP20CoGatewayInstance();
        const eip20GatewayMessageStatus = parseInt(await eip20Gateway.methods.getOutboxMessageStatus(
          messageHash,
        ).call());

        const eip20CoGatewayMessageStatus = parseInt(await eip20Cogateway.methods.getInboxMessageStatus(
          messageHash,
        ).call());

        const eip20GatewayMessage = await eip20Gateway.methods.messages(messageHash).call();
        const messageInDb = await utils.getMessageFromDB(messageHash);

        if (
          messageInDb!.sourceStatus === MessageStatus.Progressed
          && messageInDb!.targetStatus === MessageStatus.Progressed
        ) {
          expectedMessage = utils.getMessageStub(eip20GatewayMessage, messageInDb!);
          await utils.assertMintingBalance(stakerAccount.address, mintedAmount);
          expectedMessage.sourceStatus = eip20GatewayMessageStatus === 2 ? MessageStatus.Progressed : MessageStatus.Undeclared;
          expectedMessage.targetStatus = eip20CoGatewayMessageStatus === 2 ? MessageStatus.Progressed : MessageStatus.Undeclared;;
          await utils.assertMessages(messageInDb!, expectedMessage);
          clearInterval(progressPromiseInterval);
          resolve();
        }

        const currentTime = process.hrtime()[0];

        if (currentTime >= endTime) {
          return reject(new Error(`Test was not completed within ${Constants.testDuration} mins`));
        }
      },
      Constants.interval);
    }));

    await progressPromise.then(() => {
      clearInterval(progressPromiseInterval);
    }).catch((err) => {
      clearInterval(progressPromiseInterval);
      throw err;
    });
  });

  after(async () => {
    execSync(facilitatorKill, { stdio: outputOptions });
  });
});
