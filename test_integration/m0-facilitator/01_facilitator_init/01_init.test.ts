import { spawnSync } from 'child_process';
import * as path from 'path';
import fs from 'fs-extra';

import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import GatewayConfig from '@openst/mosaic-chains/lib/src/Config/GatewayConfig';
import { FacilitatorConfig } from '../../../src/m0-facilitator/Config/Config';
import assert from '../../../test/test_utils/assert';
import Directory from '../../../src/m0-facilitator/Directory';
import SharedStorage from '../SharedStorage';
import BaseTokenHelper from '../helpers/BaseTokenHelper';
import EIP20TokenHelper from '../helpers/EIP20TokenHelper';
import * as BaseTokenTestData from '../testdata/BaseToken.json';
import * as EIP20TokenTestData from '../testdata/EIP20Token.json';
import Logger from '../../../src/m0-facilitator/Logger';
import GatewayAddresses from '../../../src/m0-facilitator/Config/GatewayAddresses';

describe('facilitator init', async (): Promise<void> => {
  const testMode = process.env.TEST_MODE;
  Logger.debug('testMode', testMode);

  const mosaicConfigPath = path.join(__dirname, '../../../testdata/mosaic.json');
  const gatewayConfigPath = path.join(__dirname, '../../../testdata/0xae02c7b1c324a8d94a564bc8d713df89eae441fe.json');
  const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);
  switch (testMode) {
    case 'baseToken':
      SharedStorage.setHelperObject(new BaseTokenHelper());
      SharedStorage.setTestData(BaseTokenTestData);
      SharedStorage.setGatewayAddresses(
        GatewayAddresses.fromMosaicConfig(
          mosaicConfig,
          Number(BaseTokenTestData.auxChainId),
        ),
      );
      break;
    case 'eip20Token':
      SharedStorage.setHelperObject(new EIP20TokenHelper());
      SharedStorage.setTestData(EIP20TokenTestData);
      SharedStorage.setGatewayAddresses(
        GatewayAddresses.fromGatewayConfig(
          GatewayConfig.fromFile(gatewayConfigPath),
        ),
      );
      break;
    default:
      Logger.error('unsupported test mode for integration test: ', testMode);
      process.exit(1);
  }

  let facilitatorConfig: FacilitatorConfig;
  const outputOptions = [process.stdout, process.stderr];
  const testData = SharedStorage.getTestData();
  const helperObject = SharedStorage.getHelperObject();

  function setEnvVars() {
    process.env.AUXILIARY_RPC = testData.auxiliaryRpc;
    process.env.AUXILIARY_GRAPH_RPC = testData.auxiliaryGraphRpc;
    process.env.AUXILIARY_GRAPH_WS = testData.auxiliaryGraphWs;
    process.env.AUXILIARY_GRAPH_ADMIN_RPC = testData.auxiliaryGraphAdminRPC;
    process.env.AUXILIARY_GRAPH_IPFS = testData.auxiliaryGraphIPFS;
    process.env.AUXILIARY_WORKER_PASSWORD = testData.auxiliaryWorkerPassword;

    process.env.ORIGIN_RPC = testData.originRpc;
    process.env.ORIGIN_GRAPH_RPC = testData.originGraphRpc;
    process.env.ORIGIN_GRAPH_ADMIN_RPC = testData.originGraphAdminRPC;
    process.env.ORIGIN_GRAPH_IPFS = testData.originGraphIPFS;
    process.env.ORIGIN_GRAPH_WS = testData.originGraphWs;
    process.env.ORIGIN_WORKER_PASSWORD = testData.originWorkerPassword;

    process.env.AUXILIARY_CHAIN_ID = testData.auxChainId;
    process.env.MOSAIC_CONFIG_PATH = mosaicConfigPath;
    process.env.GATEWAY_CONFIG_PATH = gatewayConfigPath;
    process.env.ORIGIN_CHAIN = testData.originChain;
  }

  before(async () => {
    setEnvVars();
  });

  it('Validates facilitator init', async (): Promise<void> => {
    const { auxChainId } = testData;
    const { originChain } = testData;
    // Removing facilitator config.
    const { eip20GatewayAddress } = SharedStorage.getGatewayAddresses();
    fs.removeSync(Directory.getFacilitatorConfigPath(originChain, auxChainId, eip20GatewayAddress));

    const facilitatorInitScriptPath = helperObject.facilitatorInitScriptPath();
    spawnSync(facilitatorInitScriptPath, { stdio: outputOptions, env: process.env });

    facilitatorConfig = FacilitatorConfig.fromChain(originChain, auxChainId, eip20GatewayAddress);
    SharedStorage.setFacilitatorConfig(facilitatorConfig);

    assert.strictEqual(
      facilitatorConfig.auxChainId,
      auxChainId,
      'Invalid aux chain id',
    );

    assert.strictEqual(
      facilitatorConfig.originChain,
      testData.originChain,
      'Invalid origin chain id',
    );

    assert.strictEqual(
      facilitatorConfig.chains[facilitatorConfig.originChain].nodeRpc,
      testData.originRpc,
      'Invalid origin rpc',
    );

    assert.strictEqual(
      facilitatorConfig.chains[facilitatorConfig.auxChainId].nodeRpc,
      testData.auxiliaryRpc,
      'Invalid auxiliary rpc',
    );

    assert.strictEqual(
      facilitatorConfig.chains[facilitatorConfig.auxChainId].subGraphRpc,
      testData.auxiliaryGraphRpc,
      'Invalid auxiliary graph rpc',
    );

    assert.strictEqual(
      facilitatorConfig.chains[facilitatorConfig.originChain].subGraphRpc,
      testData.originGraphRpc,
      'Invalid auxiliary graph rpc',
    );
  });
});
