import { execSync, spawn } from 'child_process';
import * as path from 'path';
import BigNumber from 'bignumber.js';

import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { EIP20Token } from '@openst/mosaic-contracts/dist/interacts/EIP20Token';
import { Account } from 'web3/eth/accounts';
import { FacilitatorConfig } from '../src/Config/Config';

import Utils from './Utils';
import MosaicConfig from '../src/Config/MosaicConfig';
import StakeRequest from '../src/models/StakeRequest';

const Web3 = require('web3');

import Timeout = NodeJS.Timeout;

const facilitatorInit = path.join(__dirname, 'facilitator_init.sh');
const facilitatorStart = path.join(__dirname, 'facilitator_start.sh');
const facilitatorKill = path.join(__dirname, 'kill_facilitator_process.sh');

const originWeb3 = new Web3('http://127.0.0.1:41515');
const auxiliaryWeb3 = new Web3('http://127.0.0.1:41000');
originWeb3.transactionConfirmationBlocks = 6;
auxiliaryWeb3.transactionConfirmationBlocks = 6;
const exportWorkerPrefix = 'MOSAIC_ADDRESS_PASSW_';

describe('facilitator start', () => {
  const mosaicConfig = MosaicConfig.fromFile(path.join(__dirname, 'mosaic.json'));

  const ostComposer: string | undefined = mosaicConfig.originChain.contractAddresses.ostComposerAddress;

  const auxChainId = 1000;
  const outputOptions = [process.stdout, process.stderr];

  let facilitatorConfig: FacilitatorConfig;
  let originWorker: string;
  let utils: Utils;
  let simpleTokenInstance: EIP20Token;
  let stakerAccount: Account;
  let originFunder: string;
  let auxiliaryFunder: string;
  let auxWorkerExport;
  let originAnchorInterval: Timeout;
  const stakerOSTBalance = 20000;
  const stakeRequest = new StakeRequest(
    '',
    new BigNumber(10),
    '',
    new BigNumber(0),
    new BigNumber(0),
    new BigNumber(1),
    '',
  );

  const reward = stakeRequest.gasPrice!.mul(stakeRequest.gasLimit!);
  const mintedAmount = stakeRequest.amount!.sub(reward);

  before(async () => {
    const originAccounts = await originWeb3.eth.getAccounts();
    const auxiliaryAccounts = await auxiliaryWeb3.eth.getAccounts();
    originFunder = originAccounts[4];
    auxiliaryFunder = auxiliaryAccounts[6];
    utils = new Utils(originWeb3, auxiliaryWeb3, originFunder, auxiliaryFunder, mosaicConfig);

    // Initializing facilitator config.
    execSync(facilitatorInit, { stdio: outputOptions });
  });

  it('fund staker', async () => {
    simpleTokenInstance = utils.getSimpleTokenInstance();
    stakerAccount = originWeb3.eth.accounts.create('simpletoken');
    originWeb3.eth.accounts.wallet.add(stakerAccount);
    stakeRequest.beneficiary = stakerAccount.address;

    const transferRawTx: TransactionObject<boolean> = await simpleTokenInstance.methods.transfer(
      stakerAccount.address,
      stakerOSTBalance,
    );

    const transferReceipt = await utils.sendTransaction(
      transferRawTx,
      {
        from: originFunder,
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );
    await utils.verifyERC20Transfer(transferReceipt, stakerAccount.address, stakerOSTBalance);

    await utils.fundETHOnOrigin(stakerAccount.address);
  });

  it('funding origin and aux workers', async () => {
    facilitatorConfig = FacilitatorConfig.fromChain(auxChainId);
    originWorker = facilitatorConfig.chains[facilitatorConfig.originChain].worker;
    const auxiliaryWorker = facilitatorConfig.chains[facilitatorConfig.auxChainId].worker;
    await utils.fundETHOnOrigin(originWorker);
    await utils.fundOSTPrimeOnAuxiliary(auxiliaryWorker);
    const originWorkerExport = exportWorkerPrefix + originWorker;
    auxWorkerExport = exportWorkerPrefix + auxiliaryWorker;
    process.env[originWorkerExport] = 'origin';
    process.env[auxWorkerExport] = 'auxiliary';

    const workerOSTBalance = 500;

    const transferRawTx: TransactionObject<boolean> = await simpleTokenInstance.methods.transfer(
      originWorker,
      workerOSTBalance,
    );
    const transferReceipt = await utils.sendTransaction(
      transferRawTx,
      {
        from: originFunder,
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );
    await utils.verifyERC20Transfer(transferReceipt, originWorker, workerOSTBalance);
  });

  it('whitelist origin worker', async () => {
    await utils.whitelistOriginWorker(
      originWorker,
      100000000000,
    );
  });

  it('facilitator start', async () => {
    spawn(
      facilitatorStart,
      { stdio: outputOptions },
    );
  });

  it('request stake', async () => {
    stakeRequest.staker = stakerAccount.address;
    const ostComposerInstance = await utils.getOSTComposerInstance();

    const ostComposerApproval = 200000;

    const transferRawTx: TransactionObject<boolean> = await simpleTokenInstance.methods.approve(
      ostComposer!,
      ostComposerApproval,
    );

    await utils.sendTransaction(
      transferRawTx,
      {
        from: stakerAccount.address,
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );

    stakeRequest.gateway = mosaicConfig.auxiliaryChains[facilitatorConfig.auxChainId].contractAddresses.origin.ostEIP20GatewayAddress!;

    const requestStakeRawTx: TransactionObject<string> = await ostComposerInstance.methods.requestStake(
      stakeRequest.amount!.toNumber(),
      stakeRequest.beneficiary!,
      stakeRequest.gasPrice!.toNumber(),
      stakeRequest.gasLimit!.toNumber(),
      1,
      stakeRequest.gateway,
    );

    await utils.sendTransaction(
      requestStakeRawTx,
      {
        from: stakerAccount.address,
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );
  });

  it('start anchoring', async () => {
    originAnchorInterval = setInterval(async () => {
      await utils.anchorOrigin(facilitatorConfig.auxChainId);
    }, 30000);
  });

  it('verification of minting', async () => {
    const stakeRequestHash = utils.getStakeRequestHash(
      stakeRequest,
      stakeRequest.gateway!,
      ostComposer!,
    );

    const mintPromise = new Promise(((resolve) => {
      const verifyingMintingInterval = setInterval(async () => {
        const mintingStatus = await utils.verifyMinting(
          stakeRequestHash.toString(),
        );

        if (mintingStatus) {
          const expectedMintedAmount: BigNumber = new BigNumber(mintedAmount);
          await utils.assertMintingBalance(stakerAccount.address, expectedMintedAmount);

          await utils.assertMintProgressedInGraphClient(
            auxChainId,
            expectedMintedAmount,
            stakeRequest,
          );
          clearInterval(verifyingMintingInterval);
          clearInterval(originAnchorInterval);
          resolve();
        }
      },
      3000);
    }));

    await mintPromise;
    execSync(facilitatorKill, { stdio: outputOptions });
  });
});
