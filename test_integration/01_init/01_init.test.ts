import { spawnSync } from 'child_process';
import * as path from 'path';
import fs from 'fs-extra';

import { FacilitatorConfig } from '../../src/Config/Config';
import Utils from '../Utils';
import * as Constants from '../Constants.json';
import assert from '../../test/test_utils/assert';
import Directory from '../../src/Directory';

const facilitatorInit = path.join(__dirname, '../facilitator_init.sh');

describe('facilitator init', async (): Promise<void> => {
  const mosaicConfigPath = path.join(__dirname, '../mosaic.json');
  let facilitatorConfig: FacilitatorConfig;
  const outputOptions = [process.stdout, process.stderr];

  before(async () => {
    Utils.setEnvironment(mosaicConfigPath);
  });

  it('Validates facilitator init', async (): Promise<void> => {
    const auxChainId = Number(Constants.auxChainId);
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
  });
});
