import BigNumber from 'bignumber.js';

import { Organization } from '@openst/mosaic-contracts/dist/interacts/Organization';
import { TransactionReceipt } from 'web3-core';
import { FacilitatorConfig, ENV_WORKER_PASSWORD_PREFIX } from '../../src/Config/Config';
import Utils from '../Utils';
import SharedStorage from '../SharedStorage';
import assert from '../../test/test_utils/assert';

describe('should whitelist facilitator workers for origin & auxiliary', async (): Promise<void> => {
  const testData = SharedStorage.getTestData();
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
    expirationHeight: string,
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
      actualExpirationHeight.comparedTo(expirationHeight),
      0,
      `Expected worker expiration height is ${expirationHeight} but`
      + `got ${actualExpirationHeight}`,
    );
  }

  before(async () => {
    utils = new Utils();
    const facilitatorConfig: FacilitatorConfig = SharedStorage.getFacilitatorConfig();

    originWorker = facilitatorConfig.chains[facilitatorConfig.originChain].worker;
    auxiliaryWorker = facilitatorConfig.chains[facilitatorConfig.auxChainId].worker;
    const originWorkerExport = ENV_WORKER_PASSWORD_PREFIX + originWorker;
    const auxWorkerExport = ENV_WORKER_PASSWORD_PREFIX + auxiliaryWorker;
    process.env[originWorkerExport] = testData.originWorkerPassword;
    process.env[auxWorkerExport] = testData.auxiliaryWorkerPassword;
  });

  it('should whitelist origin worker', async () => {
    const organizationInstance = await utils.getOriginOrganizationInstance();
    const txReceipt = await utils.whitelistOriginWorker(
      organizationInstance,
      originWorker,
      testData.originWorkerExpirationHeight,
    );
    await assertWorkerWhitelisting(
      txReceipt,
      organizationInstance,
      originWorker,
      testData.originWorkerExpirationHeight,
    );
  });

  it('should whitelist auxiliary worker', async () => {
    const organizationInstance = await utils.getAuxiliaryOrganizationInstance();
    const txReceipt = await utils.whitelistAuxiliaryWorker(
      organizationInstance,
      auxiliaryWorker,
      testData.auxiliaryWorkerExpirationHeight,
    );
    await assertWorkerWhitelisting(
      txReceipt,
      organizationInstance,
      auxiliaryWorker,
      testData.auxiliaryWorkerExpirationHeight,
    );
  });
});
