import { ChildProcess, execSync, spawn } from 'child_process';
import * as path from 'path';

import BigNumber from 'bignumber.js';
import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { FacilitatorConfig } from '../src/Config/Config';

import Utils from './Utils';
import MosaicConfig from '../src/Config/MosaicConfig';
import { default as SrcUtils } from '../src/Utils';

const Web3 = require('web3');

const facilitatorInit = path.join(__dirname, 'facilitator_init.sh');
const facilitatorStart = path.join(__dirname, 'facilitator_start.sh');

const originWeb3 = new Web3('http://127.0.0.1:41515');
const auxiliaryWeb3 = new Web3('http://127.0.0.1:41000');
const exportWorkerPrefix = 'MOSAIC_ADDRESS_PASSW_';

describe('facilitator start', () => {
  const mosaicConfig = MosaicConfig.fromFile(path.join(__dirname, 'mosaic.json'));

  const ostComposer: string | undefined = mosaicConfig.originChain.contractAddresses.ostComposerAddress;

  const auxChainId = 1000;
  const outputOptions = [process.stdout, process.stderr];

  let facilitatorConfig: FacilitatorConfig;
  let originWorker: string;
  let auxiliaryWorker: string;
  let utils: Utils;
  let simpleTokenInstance: any;
  let stakerAccount: any;
  let originFunder: string;
  let auxiliaryFunder: string;
  let originWorkerExport;
  let auxWorkerExport;
  let facilitatorStartChildProcess: ChildProcess;
  let originAnchorInterval: any;
  const stakerERC20Balance = 20000;
  const stakeRequest = <any>{};

  before(async () => {
    originFunder = '0x40ebe1ce3428b9cbaddbc20af27f1c4780b7d49f'; // originAccounts[3];
    auxiliaryFunder = '0x275605cba18458f45c67a1a3b8899f481e79bb18'; // auxiliaryAccounts[3]
    utils = new Utils(originWeb3, auxiliaryWeb3, originFunder, auxiliaryFunder, mosaicConfig);

    // Initializing facilitator config.
    execSync(facilitatorInit, { stdio: outputOptions });
  });

  it('fund staker', async () => {
    simpleTokenInstance = utils.getSimpleTokenInstance();

    stakerAccount = originWeb3.eth.accounts.create('ost');
    originWeb3.eth.accounts.wallet.add(stakerAccount);

    const transferReceipt = await simpleTokenInstance.methods.transfer(
      stakerAccount.address,
      stakerERC20Balance,
    ).send(
      {
        from: originFunder,
      },
    );

    await utils.verifyERC20Transfer(transferReceipt, stakerAccount.address, stakerERC20Balance);

    await utils.fundETHOnOrigin(stakerAccount.address);
  });

  it('funding origin and aux workers', async () => { // may be break into 2 it's.
    facilitatorConfig = FacilitatorConfig.fromChain(auxChainId);
    originWorker = facilitatorConfig.chains[facilitatorConfig.originChain].worker;
    auxiliaryWorker = facilitatorConfig.chains[facilitatorConfig.auxChainId].worker;

    await utils.fundETHOnOrigin(originWorker);

    await utils.fundOSTPrimeOnAuxiliary(auxiliaryWorker);

    originWorkerExport = exportWorkerPrefix + originWorker;
    auxWorkerExport = exportWorkerPrefix + auxiliaryWorker;
    process.env[originWorkerExport] = 'origin';
    process.env[auxWorkerExport] = 'auxiliary';

    const workerOSTBalance = 500;
    const transferReceipt = await simpleTokenInstance.methods.transfer(
      originWorker,
      workerOSTBalance,
    ).send(
      {
        from: originFunder,
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
    facilitatorStartChildProcess = spawn(
      facilitatorStart,
      { stdio: outputOptions },
    );
  });

  it('request stake', async () => {
    stakeRequest.amount = '10';
    stakeRequest.gasPrice = 0;
    stakeRequest.gasLimit = 0;
    stakeRequest.nonce = 1;
    stakeRequest.gateway = mosaicConfig.auxiliaryChains[facilitatorConfig.auxChainId].contractAddresses.origin.ostEIP20GatewayAddress;

    const ostComposerInstance = await utils.getOSTComposerInstance();

    stakeRequest.beneficiary = originWeb3.eth.accounts.create('ost');

    await simpleTokenInstance.methods.approve(ostComposer, 200000).send(
      {
        from: stakerAccount.address,
        gas: 70000,
      },
    );

    const requestStakeRawTx: TransactionObject<string> = await ostComposerInstance.methods.requestStake(
      stakeRequest.amount,
      stakerAccount.address,
      0,
      0,
      1,
      stakeRequest.gateway,
    );

    await SrcUtils.sendTransaction(
      requestStakeRawTx,
      {
        from: stakerAccount.address,
        gasPrice: '0x174876E800',
      },
      originWeb3,
    );
  });

  it('start anchoring', async () => {
    originAnchorInterval = setInterval(async () => {
      await utils.anchorOrigin(facilitatorConfig.auxChainId);
    }, 30000);
  });

  it('verification of minting', async () => {
    const stakeRequestHash = utils.getStakeRequestHash({
      amount: stakeRequest.amount,
      beneficiary: stakerAccount.address,
      gasPrice: stakeRequest.gasPrice,
      gasLimit: stakeRequest.gasLimit,
      nonce: stakeRequest.nonce,
      staker: stakerAccount.address,
    },
    stakeRequest.gateway,
    ostComposer);

    const verifyingMintingInterval = setInterval(async () => {
      const mintingStatus = await utils.verifyMinting(
        stakeRequestHash.toString(),
      );

      if (mintingStatus) {
        const expectedMintedAmount: BigNumber = new BigNumber(10);
        await utils.assertMintingBalance(stakerAccount.address, expectedMintedAmount);

        await utils.assertMintProgressedInGraphClient(auxChainId, expectedMintedAmount, stakeRequest);
        clearInterval(verifyingMintingInterval);
        clearInterval(originAnchorInterval);

        process.kill(facilitatorStartChildProcess.pid, 'SIGTERM');
      }
    },
    3000);
  });
});
