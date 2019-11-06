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

import Account from '../Account';
import {
  Chain, FacilitatorConfig, Config, ENV_WORKER_PASSWORD_PREFIX,
} from '../Config/Config';
import DatabaseFileHelper from '../DatabaseFileHelper';
import Logger from '../Logger';

import Repositories from '../repositories/Repositories';
import SeedData from '../SeedData';
import GatewayAddresses from '../Config/GatewayAddresses';
import FacilitatorInit from '../lib/FacilitatorInit';
import Directory from '../Directory';

commander
  .option('-m, --mosaic-config <mosaic-config>', 'path to mosaic configuration')
  .option('-g, --gateway-config <gateway-config>', 'path to gateway configuration')
  .option('-c, --aux-chain-id <aux-chain-id>', 'auxiliary chain id')
  .option('-o, --origin-password <origin-password>', 'origin chain account password')
  .option('-a, --auxiliary-password <auxiliary-password>', 'auxiliary chain account password')
  .option('-r, --origin-rpc <origin-rpc>', 'origin chain rpc')
  .option('-h, --auxiliary-rpc <auxiliary-rpc>', 'auxiliary chain rpc')
  .option('-e, --origin-graph-ws <origin-graph-ws>', 'origin ws subgraph endpoint ')
  .option('-n, --origin-graph-rpc <origin-graph-rpc>', 'origin rpc subgraph endpoint')
  .option('-s, --auxiliary-graph-ws <auxiliary-graph-ws>', 'auxiliary ws subgraph endpoint')
  .option('-i, --auxiliary-graph-rpc <auxiliary-graph-rpc>', 'auxiliary rpc subgraph endpoint')
  .option('-d, --db-path <db-path>', 'path where db path is present')
  .option('-f, --force', 'forcefully override facilitator config')
  .action(async (options) => {
    // Validating mandatory parameters
    let mandatoryOptionMissing = false;

    if (
      (options.mosaicConfig && options.gatewayConfig)
      || (options.gatewayConfig === undefined && options.mosaicConfig === undefined)
    ) {
      Logger.error('one option out of gateway config and mosaic config is required.');
      mandatoryOptionMissing = true;
    }

    if (options.auxChainId === undefined) {
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

    const { originPassword } = options;
    if (originPassword === undefined) {
      Logger.error('required --origin-password <origin-password>');
      mandatoryOptionMissing = true;
    }

    const { auxiliaryPassword } = options;
    if (auxiliaryPassword === undefined) {
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
      Logger.info('refer readme for more details');
      process.exit(1);
    }

    // Get origin chain id.
    const auxChainId = parseInt(options.auxChainId);
    let originChainId: string | undefined;
    let gatewayAddresses: GatewayAddresses | undefined;
    if (options.mosaicConfig !== undefined) {
      (
        {
          originChainId,
          gatewayAddresses,
        } = FacilitatorInit.getFromMosaicConfig(auxChainId, options.mosaicConfig)
      );
    }

    if (options.gatewayConfig !== undefined) {
        (
          {
            originChainId,
            gatewayAddresses,
          } = FacilitatorInit.getFromGatewayConfig(auxChainId, options.gatewayConfig)
        );
      }

      if (!originChainId) {
        throw new Error(`Invalid origin chain id ${originChainId} in config`);
      }

      if (!gatewayAddresses) {
        throw new Error(`Gateway addresses cannot be ${gatewayAddresses}`);
      }

    try {
      if (options.force) {
        FacilitatorConfig.remove(originChainId, auxChainId, gatewayAddresses!.eip20CoGatewayAddress);
      } else if (FacilitatorConfig.isFacilitatorConfigPresent(originChainId!, auxChainId, gatewayAddresses!.eip20CoGatewayAddress)) {
        throw new Error('facilitator config already present. use -f option to override the existing facilitator config.');
      }
      Logger.info('creating facilitator config');
      const facilitatorConfig = FacilitatorConfig.fromChain(originChainId!, auxChainId, gatewayAddresses!.eip20CoGatewayAddress);

      facilitatorConfig.originChain = originChainId!;
      facilitatorConfig.auxChainId = auxChainId;

      let { dbPath } = options;
      if (dbPath === undefined || dbPath === null) {
        Logger.info('database path is not provided');
        dbPath = DatabaseFileHelper.create(originChainId, auxChainId, gatewayAddresses!.eip20CoGatewayAddress);
      } else if (DatabaseFileHelper.verify(dbPath)) {
        Logger.info('DB file verified');
      } else {
        throw new Error('DB file doesn\'t exists or file extension is incorrect');
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

        facilitatorConfig.chains[chainId] = new Chain(
          rpc,
          account.address,
          subGraphWs,
          subGraphRpc,
        );
        const envVariableNameForWorkerPassword = `${ENV_WORKER_PASSWORD_PREFIX}${account.address}`;
        process.env[envVariableNameForWorkerPassword] = password;
        facilitatorConfig.encryptedAccounts[account.address] = account.encryptedKeyStore;
      };
      setFacilitator(
        originChainId!,
        options.originRpc,
        options.originGraphWs,
        options.originGraphRpc,
        originPassword,
      );
      setFacilitator(
        auxChainId.toString(),
        options.auxiliaryRpc,
        options.auxiliaryGraphWs,
        options.auxiliaryGraphRpc,
        auxiliaryPassword,
      );

      const config = new Config(gatewayAddresses!, facilitatorConfig);
      const repositories = await Repositories.create(config.facilitator.database.path);
      const seedData = new SeedData(
        config,
        repositories.gatewayRepository,
        repositories.auxiliaryChainRepository,
        repositories.contractEntityRepository,
      );
      const {
        eip20GatewayBounty,
        eip20CoGatewayBounty,
      } = await seedData.populateDb();

      facilitatorConfig.writeToFacilitatorConfig(originChainId, auxChainId, gatewayAddresses!.eip20CoGatewayAddress);
      Logger.info('facilitator config file is generated');
      console.log('--------------------------------------------------------------------------------------------------------');
      console.log('Below points to be noted : ');
      console.log(`1. Facilitator config path is generated at ${Directory.getFacilitatorConfigPath(originChainId, auxChainId, gatewayAddresses!.eip20CoGatewayAddress)}. Back it up as it contains encrypted keys which will own funds.`);
      console.log(`2. Worker address for ${originChainId} (origin) chain is ${facilitatorConfig.chains[originChainId].worker}`);
      console.log(`3. Worker address for ${auxChainId} (auxiliary) chain is ${facilitatorConfig.chains[auxChainId].worker}`);
      console.log(`4. For each stake and mint facilitation requires funds ${eip20GatewayBounty.toString(10)}(wei) of ${config.gatewayAddresses.baseTokenAddress} token for bounty on ${originChainId} chain.`);
      console.log(`5. For each redeem and unstake facilitation, bounty amount in base token is ${eip20CoGatewayBounty.toString(10)}(wei) which should be funded to chain id ${auxChainId} (auxiliary) worker.`);
      console.log('6. Set below environment variables : ');
      console.log(`\t i. ${ENV_WORKER_PASSWORD_PREFIX + facilitatorConfig.chains[originChainId].worker}=${originPassword}`);
      console.log(`\tii. ${ENV_WORKER_PASSWORD_PREFIX + facilitatorConfig.chains[auxChainId].worker}=${auxiliaryPassword} \n`);
      // Explicitly exit process as web3 on websocket holds the connection
      // and let app to close.
      process.exit(0);
    } catch (e) {
      Logger.error(e);
      process.exit(1);
    }
  })
  .parse(process.argv);
