import * as path from 'path';
import BigNumber from 'bignumber.js';

import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import { Organization } from '@openst/mosaic-contracts/dist/interacts/Organization';
import { TransactionReceipt } from 'web3-core';
import { FacilitatorConfig } from '../../src/Config/Config';
import Utils from '../Utils';
import * as Constants from '../Constants.json';
import assert from '../../test/test_utils/assert';

describe('should whitelist facilitator workers for origin & auxiliary', async (): Promise<void> => {
  const auxChainId = Number(Constants.auxChainId);
  const mosaicConfigPath = path.join(__dirname, '../mosaic.json');
  const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);
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

    utils.setWorkerPasswordInEnvironment();

    originWorker = facilitatorConfig.chains[facilitatorConfig.originChain].worker;
    auxiliaryWorker = facilitatorConfig.chains[auxChainId].worker;

  });

  it('should whitelist origin worker', async () => {
    const organizationInstance = await utils.getOriginOrganizationInstance();
    const txReceipt = await utils.whitelistOriginWorker(
      organizationInstance,
      originWorker,
      Constants.originWorkerExpirationHeight,
    );
    await assertWorkerWhitelisting(
      txReceipt,
      organizationInstance,
      originWorker,
      Constants.originWorkerExpirationHeight,
    );
  });

  it('should whitelist auxiliary worker', async () => {
    const organizationInstance = await utils.getAuxiliaryOrganizationInstance();
    const txReceipt = await utils.whitelistAuxiliaryWorker(
      organizationInstance,
      auxiliaryWorker,
      Constants.auxiliaryWorkerExpirationHeight,
    );
    await assertWorkerWhitelisting(
      txReceipt,
      organizationInstance,
      auxiliaryWorker,
      Constants.auxiliaryWorkerExpirationHeight,
    );
  });

});
