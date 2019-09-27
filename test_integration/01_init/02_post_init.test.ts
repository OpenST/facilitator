import * as path from 'path';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import { EIP20Token } from '@openst/mosaic-contracts/dist/interacts/EIP20Token';
import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import { FacilitatorConfig } from '../../src/Config/Config';
import Utils from '../Utils';
import * as Constants from '../Constants.json';
import assert from '../../test/test_utils/assert';
import { Organization } from '@openst/mosaic-contracts/dist/interacts/Organization';
import { TransactionReceipt } from 'web3-core';
import SharedStorage from "../SharedStorage";

describe('facilitator post init', async (): Promise<void> => {

  let originWeb3: Web3;
  let auxiliaryWeb3: Web3;
  const auxChainId: number = Number(Constants.auxChainId);
  const mosaicConfigPath = path.join(__dirname, '../mosaic.json');
  const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);

  const OSTToBeFundedToWorkerForBounty = new BigNumber(500);
  const amountTobeFundedOnOrigin = new BigNumber(1);
  const amountTobeFundedOnAuxiliary = new BigNumber(1);

  let originWorker: string;
  let auxiliaryWorker: string;
  let utils: Utils;

  /**
   * It whitelists address of an account.
   * @param whitelistWorkerReceipt txReceipt for whitelisting tx
   * @param organizationInstance organization contract instance
   * @param address Address to be whitelisted.
   * @param expirationHeight Block number at which address becomes invalid.
   */
  async function assertWorkerWhitelisting(
    whitelistWorkerReceipt: TransactionReceipt,
    organizationInstance: Organization,
    address: string,
    expirationHeight: string
  ) {

    assert.strictEqual(
      whitelistWorkerReceipt.status,
      true,
    );

    const actualExpirationHeight = new BigNumber(await organizationInstance.methods.workers(
      address,
    ).call());

    assert.strictEqual(
      await organizationInstance.methods.isWorker(address).call(),
      true,
    );

    assert.strictEqual(
      actualExpirationHeight.cmp(expirationHeight),
      0,
      `Expected worker expiration height is ${expirationHeight} but`
      + `got ${actualExpirationHeight}`,
    );
  }

  before(async () => {

    const facilitatorConfig: FacilitatorConfig = FacilitatorConfig.fromChain(auxChainId);
    utils = new Utils(
      mosaicConfig,
      facilitatorConfig,
      Number(Constants.auxChainId),
    );
    ({ originWeb3, auxiliaryWeb3 } = utils);

    utils.setWorkerPasswordInEnvironment();

    originWorker = facilitatorConfig.chains[facilitatorConfig.originChain].worker;
    auxiliaryWorker = facilitatorConfig.chains[auxChainId].worker;

    const originAccounts = await originWeb3.eth.getAccounts();
    SharedStorage.setOriginFunder(originAccounts[4]);

    const auxiliaryAccounts = await auxiliaryWeb3.eth.getAccounts();
    SharedStorage.setAuxiliaryFunder(auxiliaryAccounts[6]);

  });

  it('whitelist origin worker', async () => {
    const organizationInstance = await utils.getOriginOrganizationInstance();
    const txReceipt = await utils.whitelistOriginWorker(
      organizationInstance,
      originWorker,
      Constants.originWorkerExpirationHeight
    );
    await assertWorkerWhitelisting(
      txReceipt,
      organizationInstance,
      originWorker,
      Constants.originWorkerExpirationHeight
    );
  });

  it('whitelist auxiliary worker', async () => {
    const organizationInstance = await utils.getAuxiliaryOrganizationInstance();
    const txReceipt = await utils.whitelistAuxiliaryWorker(
      organizationInstance,
      auxiliaryWorker,
      Constants.auxiliaryWorkerExpirationHeight
    );
    await assertWorkerWhitelisting(
      txReceipt,
      organizationInstance,
      auxiliaryWorker,
      Constants.auxiliaryWorkerExpirationHeight
    );
  });

  it('funding origin and aux workers', async (): Promise<void> => {
    await utils.fundEthOnOrigin(originWorker, new BigNumber(amountTobeFundedOnOrigin));
    await utils.fundOSTPrimeOnAuxiliary(
      auxiliaryWorker,
      new BigNumber(amountTobeFundedOnAuxiliary),
    );
    let simpleTokenInstance: EIP20Token =  utils.getSimpleTokenInstance();
    const transferRawTx: TransactionObject<boolean> = simpleTokenInstance.methods.transfer(
      originWorker,
      OSTToBeFundedToWorkerForBounty.toString(),
    );
    const transferReceipt = await Utils.sendTransaction(
      transferRawTx,
      {
        from: SharedStorage.getOriginFunder(),
        gasPrice: await originWeb3.eth.getGasPrice(),
      },
    );
    await utils.verifyOSTTransfer(transferReceipt, originWorker, new BigNumber(OSTToBeFundedToWorkerForBounty));
  });

});
