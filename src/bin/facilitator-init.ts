// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------


import commander from 'commander';
import Web3 from 'web3';

import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import Account from '../Account';
import {
  Chain, FacilitatorConfig, Config, ENV_WORKER_PASSWORD_PREFIX,
} from '../Config/Config';
import DatabaseFileHelper from '../DatabaseFileHelper';
import Logger from '../Logger';

import Repositories from '../repositories/Repositories';
import SeedData from '../SeedData';
import GatewayConfig from '@openst/mosaic-chains/lib/src/Config/GatewayConfig';
import GatewayAddresses from '../Config/GatewayAddresses';

/**
 * It provides gateway addresses and origin chain id. It is to be used when mosaic
 * config is provided.
 * @param auxChainId Auxiliary chain id.
 * @param mosaicConfigPath Path to mosaic config.
 * @returns originchain id and gatewayaddresses object.
 */
function getFromMosaicConfig(
  auxChainId: number,
  mosaicConfigPath: string
): {
  originChainId: string; gatewayAddresses: GatewayAddresses
} {
    const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);
    const auxChain = mosaicConfig.auxiliaryChains[auxChainId];
    if (auxChain === null || auxChain === undefined) {
      Logger.error(`auxchain id ${auxChainId} is not present in the mosaic config`);
      process.exit(1);
    }

  return {
    originChainId: mosaicConfig.originChain.chain,
    gatewayAddresses: GatewayAddresses.fromMosaicConfig(mosaicConfig, auxChainId)
  };
}

/**
 * It provides gateway addresses and origin chain id. It is to be used when gateway
 * config is provided.
 * @param auxChainId Auxiliary chain id.
 * @param gatewayConfigPath Path to gateway config.
 * @returns originchain id and gatewayaddresses object.
 */
function getFromGatewayConfig(
  auxChainId: number,
  gatewayConfigPath: string
): {
  originChainId: string; gatewayAddresses: GatewayAddresses
} {
    const gatewayConfig = GatewayConfig.fromFile(gatewayConfigPath);

    if (auxChainId === gatewayConfig.auxChainId) {
      Logger.error(`aux chain id present in gateway config is ${gatewayConfig.auxChainId}`+
        `but ${auxChainId} is specified in the command`);
      process.exit(1);
    }

  const gatewayAddresses = GatewayAddresses.fromGatewayConfig(gatewayConfig);
  return {
    originChainId: gatewayConfig.mosaicConfig.originChain.chain,
    gatewayAddresses
  }
}

commander
  .option('-m, --mosaic-config <mosaic-config>', 'path to mosaic configuration')
  .option('-q, --gateway-config <gateway-config>', 'path to gateway configuration')
  .option('-c, --aux-chain-id <aux-chain-id>', 'auxiliary chain id')
  .option('-o, --origin-password <origin-password>', 'origin chain account password')
  .option('-a, --auxiliary-password <auxiliary-password>', 'auxiliary chain account password')
  .option('-r, --origin-rpc <origin-rpc>', 'origin chain rpc')
  .option('-h, --auxiliary-rpc <auxiliary-rpc>', 'auxiliary chain rpc')
  .option('-e, --origin-graph-ws <origin-graph-ws>', 'origin ws subgraph endpoint ')
  .option('-g, --origin-graph-rpc <origin-graph-rpc>', 'origin rpc subgraph endpoint')
  .option('-s, --auxiliary-graph-ws <auxiliary-graph-ws>', 'auxiliary ws subgraph endpoint')
  .option('-i, --auxiliary-graph-rpc <auxiliary-graph-rpc>', 'auxiliary rpc subgraph endpoint')
  .option('-d, --db-path <db-path>', 'path where db path is present')
  .option('-f, --force', 'forcefully override facilitator config')
  .action(async (options) => {
    // Validating mandatory parameters
    let mandatoryOptionMissing = false;
    console.log('options :- ',options);

    if(
      (options.mosaicConfig && options.gatewayConfig) ||
      (options.gatewayConfig === undefined && options.mosaicConfig === undefined)
    ) {
      Logger.error('only one option out of gateway config and mosaic config is required. ' +
        'refer readme for more details');
      process.exit(1);
    }

    const { auxChainId } = options;
    if (auxChainId === undefined) {
      Logger.error('required --aux-chain-id <aux-chain-id>');
      mandatoryOptionMissing = true;
    }

    if (options.originRpc === undefined) {
      Logger.error('required --origin-rpc <origin-rpc>');
      mandatoryOptionMissing = true;
    }

    if (options.auxiliaryRpc === undefined) {
      Logger.error('required --auxiliary-rpc <auxiliary-rpc>');
      mandatoryOptionMissing = true;
    }

    if (options.originPassword === undefined) {
      Logger.error('required --origin-password <origin-password>');
      mandatoryOptionMissing = true;
    }

    if (options.auxiliaryPassword === undefined) {
      Logger.error('required --auxiliary-password <auxiliary-password>');
      mandatoryOptionMissing = true;
    }

    if (options.originGraphWs === undefined) {
      Logger.error('required --origin-graph-ws <origin-graph-ws>');
      mandatoryOptionMissing = true;
    }

    if (options.auxiliaryGraphWs === undefined) {
      Logger.error('required --auxiliary-graph-ws <auxiliary-graph-ws>');
      mandatoryOptionMissing = true;
    }

    if (options.originGraphRpc === undefined) {
      Logger.error('required --origin-graph-rpc <origin-graph-rpc>');
      mandatoryOptionMissing = true;
    }

    if (options.auxiliaryGraphRpc === undefined) {
      Logger.error('required --auxiliary-graph-rpc <auxiliary-graph-rpc>');
      mandatoryOptionMissing = true;
    }

    if (mandatoryOptionMissing) {
      process.exit(1);
    }

    if (options.force) {
      FacilitatorConfig.remove(auxChainId);
    } else {
      try {
        if (FacilitatorConfig.isFacilitatorConfigPresent(auxChainId)) {
          Logger.error('facilitator config already present. use -f option to override the existing facilitator config.');
          process.exit(1);
        }
      } catch (e) {
        Logger.info('creating facilitator config as it is not present');
      }
    }

    const facilitatorConfig = FacilitatorConfig.fromChain(auxChainId);

    // Get origin chain id.
    const {
      originChainId,
      gatewayAddresses,
    } = options.mosaicConfig !== undefined ? getFromMosaicConfig(auxChainId, options.mosaicConfig) :
      getFromGatewayConfig(auxChainId, options.gatewayConfig);

    facilitatorConfig.originChain = originChainId;
    facilitatorConfig.auxChainId = auxChainId;

    let { dbPath } = options;
    if (dbPath === undefined || dbPath === null) {
      Logger.info('database path is not provided');
      dbPath = DatabaseFileHelper.create(auxChainId);
    } else if (DatabaseFileHelper.verify(dbPath)) {
      Logger.info('DB file verified');
    } else {
      Logger.error('DB file doesn\'t exists or file extension is incorrect');
      process.exit(1);
    }

    facilitatorConfig.database.path = dbPath;

    const setFacilitator = (
      chainId: string,
      rpc: string,
      subGraphWs: string,
      subGraphRpc: string,
      password: string,
    ): void => {
      const account: Account = Account.create(new Web3(''), password);

      facilitatorConfig.chains[chainId] = new Chain(rpc, account.address, subGraphWs, subGraphRpc);
      const envVariableNameForWorkerPassword = `${ENV_WORKER_PASSWORD_PREFIX}${account.address}`;
      process.env[envVariableNameForWorkerPassword] = password;

      facilitatorConfig.encryptedAccounts[account.address] = account.encryptedKeyStore;
    };

    setFacilitator(
      originChainId,
      options.originRpc,
      options.originGraphWs,
      options.originGraphRpc,
      options.originPassword,
    );

    setFacilitator(
      auxChainId,
      options.auxiliaryRpc,
      options.auxiliaryGraphWs,
      options.auxiliaryGraphRpc,
      options.auxiliaryPassword,
    );

    const config = new Config(gatewayAddresses, facilitatorConfig);
    const repositories = await Repositories.create(config.facilitator.database.path);
    const seedData = new SeedData(
      config,
      repositories.gatewayRepository,
      repositories.auxiliaryChainRepository,
      repositories.contractEntityRepository,
    );
    await seedData.populateDb();

    facilitatorConfig.writeToFacilitatorConfig(auxChainId);
    Logger.info('facilitator config file is generated');

    Logger.info(`👉 worker address for ${originChainId} chain is `
    + `${facilitatorConfig.chains[originChainId].worker}`);

    Logger.info(`👉 worker address for ${auxChainId} chain is `
      + `${facilitatorConfig.chains[auxChainId].worker}`);
  })
  .parse(process.argv);
