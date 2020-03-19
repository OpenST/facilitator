// Copyright 2020 OpenST Ltd.
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

import Web3 from 'web3';
import Mosaic from 'Mosaic';
import BigNumber from 'bignumber.js';
import { interacts } from '@openst/mosaic-contracts';

import Anchor from './models/Anchor';
import Gateway, { GatewayType } from './models/Gateway';
import Repositories from './repositories/Repositories';
import ContractEntity, { EntityType } from '../common/models/ContractEntity';
import Utils from '../common/Utils';
import Logger from '../common/Logger';
import { ArchitectureLayout } from './manifest/Manifest';

/**
 * Initializes the seed data in repositories and validate the seeded data.
 */
export default class SeedDataInitializer {
  /** Instance of Repositories class. */
  private repositories: Repositories;

  /**
   * Construct the SeedDataInitializer with the params.
   *
   * @param repositories Instance of repository class.
   */
  public constructor(
    repositories: Repositories,
  ) {
    this.repositories = repositories;
  }

  /**
   * Generate and save records that should be populated as seed data. It makes
   *    web3 call to fetch other information like cogateway address, origin
   *    anchor, auxiliary anchor, lastAnchoredBlockHeight from gateway address.
   * - Saves erc20Gateway record.
   * - Saves erc20Cogateway record.
   * - Saves origin anchor record.
   * - Saves auxiliary anchor record.
   * - Save contract entity records with the updated timestamp value of last
   *   block timestamp.
   *
   * @param originWeb3 Instance of origin web3.
   * @param auxiliaryWeb3 Instance of auxiliary web3.
   * @param erc20GatewayAddress ERC20 Gateway address.
   * @param architectureLayout Architecture layout.
   */
  public async initialize(
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    erc20GatewayAddress: string,
    architectureLayout: ArchitectureLayout,
  ): Promise<void> {
    const erc20Gateway = Mosaic.interacts.getERC20Gateway(originWeb3, erc20GatewayAddress);
    const cogatewayAddress = await erc20Gateway.methods.messageOutbox().call();
    const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(
      auxiliaryWeb3,
      cogatewayAddress,
    );

    const originAnchorAddress = await erc20Gateway.methods.stateRootProvider().call();
    const auxiliaryAnchorAddress = await erc20Cogateway.methods.stateRootProvider().call();
    let auxiliaryLatestAnchoredStateRootBlockHeight: string;
    let originLatestAnchoredStateRootBlockHeight: string;
    if (ArchitectureLayout.MOSAIC1_0_14 === architectureLayout) {
      const originAnchorInstance = Mosaic.interacts.getAnchor(
        originWeb3,
        originAnchorAddress,
      );
      const auxiliaryAnchorInstance = Mosaic.interacts.getAnchor(
        auxiliaryWeb3,
        auxiliaryAnchorAddress,
      );

      auxiliaryLatestAnchoredStateRootBlockHeight = await originAnchorInstance.methods
        .getLatestStateRootBlockNumber().call();
      originLatestAnchoredStateRootBlockHeight = await auxiliaryAnchorInstance.methods
        .getLatestStateRootBlockNumber().call();
    } else {
      const originAnchorInstance = interacts.getAnchor(
        originWeb3,
        originAnchorAddress,
      );
      const auxiliaryAnchorInstance = interacts.getAnchor(
        auxiliaryWeb3,
        auxiliaryAnchorAddress,
      );

      originLatestAnchoredStateRootBlockHeight = await originAnchorInstance.methods
        .getLatestStateRootBlockHeight().call();
      auxiliaryLatestAnchoredStateRootBlockHeight = await auxiliaryAnchorInstance.methods
        .getLatestStateRootBlockHeight().call();
    }

    const originGateway = new Gateway(
      Gateway.getGlobalAddress(erc20GatewayAddress),
      Gateway.getGlobalAddress(cogatewayAddress),
      GatewayType.ERC20,
      Anchor.getGlobalAddress(originAnchorAddress),
      new BigNumber(0),
    );

    const auxiliaryGateway = new Gateway(
      Gateway.getGlobalAddress(cogatewayAddress),
      Gateway.getGlobalAddress(erc20GatewayAddress),
      GatewayType.ERC20,
      Anchor.getGlobalAddress(auxiliaryAnchorAddress),
      new BigNumber(0),
    );

    const originAnchor = new Anchor(
      Anchor.getGlobalAddress(originAnchorAddress),
      new BigNumber(auxiliaryLatestAnchoredStateRootBlockHeight),
    );

    const auxiliaryAnchor = new Anchor(
      Anchor.getGlobalAddress(auxiliaryAnchorAddress),
      new BigNumber(originLatestAnchoredStateRootBlockHeight),
    );

    const originLastBlockTimestamp = await Utils.latestBlockTimestamp(originWeb3);
    const auxiliaryLastBlockTimestamp = await Utils.latestBlockTimestamp(auxiliaryWeb3);

    const contractEntities = SeedDataInitializer.getContractEntities(
      erc20GatewayAddress,
      originLastBlockTimestamp,
      auxiliaryLastBlockTimestamp,
      cogatewayAddress,
      originAnchorAddress,
      auxiliaryAnchorAddress,
    );

    const saveContractEntityPromises = contractEntities.map(
      async (contractEntity): Promise<void> => {
        await this.repositories.contractEntityRepository.save(contractEntity);
      },
    );

    await Promise.all(saveContractEntityPromises);

    await this.repositories.anchorRepository.save(originAnchor);
    await this.repositories.anchorRepository.save(auxiliaryAnchor);

    await this.repositories.gatewayRepository.save(auxiliaryGateway);
    await this.repositories.gatewayRepository.save(originGateway);
  }

  /**
   * Verifies if the database is initialized with correct seed data. To do the
   * verification, the ERC20Gateway address from the manifest file is checked
   * if it is already stored in the database. If its stored then its verified.
   *
   * @param gatewayAddress Gateway address for which seed data is to be verified.
   *
   * @returns Returns true if the gateway record is present for the given gateway address.
   */
  public async isValidSeedData(gatewayAddress: string): Promise<boolean> {
    const gatewayGA = Gateway.getGlobalAddress(gatewayAddress);
    Logger.debug(`Verifying seed data for gateway ${gatewayGA}`);
    const gatewayRecord = await this.repositories.gatewayRepository.get(gatewayGA);

    return (gatewayRecord !== null);
  }

  /**
   * Returns list of contract entities.
   *
   * @param erc20GatewayAddresses ERC20 Gateway address.
   * @param originLastBlockTimeStamp Origin chain last block timestamp.
   * @param auxiliaryLastBlockTimeStamp Auxiliary chain last block timestamp.
   * @param erc20CogatewayAddress ERC20 Cogateway address.
   * @param originAnchorAddress Origin anchor address.
   * @param auxiliaryAnchorAddress Auxiliary anchor address.
   */
  private static getContractEntities(
    erc20GatewayAddresses: string,
    originLastBlockTimeStamp: BigNumber,
    auxiliaryLastBlockTimeStamp: BigNumber,
    erc20CogatewayAddress: string,
    originAnchorAddress: string,
    auxiliaryAnchorAddress: string,
  ): ContractEntity[] {
    return [
      new ContractEntity(
        erc20GatewayAddresses,
        EntityType.ProvenGateways,
        originLastBlockTimeStamp,
      ),
      new ContractEntity(
        erc20CogatewayAddress,
        EntityType.ProvenGateways,
        auxiliaryLastBlockTimeStamp,
      ),
      new ContractEntity(
        originAnchorAddress,
        EntityType.AvailableStateRoots,
        originLastBlockTimeStamp,
      ),
      new ContractEntity(
        auxiliaryAnchorAddress,
        EntityType.AvailableStateRoots,
        auxiliaryLastBlockTimeStamp,
      ),
      new ContractEntity(
        erc20GatewayAddresses,
        EntityType.DeclaredDepositIntents,
        originLastBlockTimeStamp,
      ),
      new ContractEntity(
        erc20CogatewayAddress,
        EntityType.ConfirmedDepositIntents,
        auxiliaryLastBlockTimeStamp,
      ),
      new ContractEntity(
        erc20CogatewayAddress,
        EntityType.CreatedUtilityTokens,
        auxiliaryLastBlockTimeStamp,
      ),
      new ContractEntity(
        erc20GatewayAddresses,
        EntityType.ConfirmedWithdrawIntents,
        originLastBlockTimeStamp,
      ),
      new ContractEntity(
        erc20CogatewayAddress,
        EntityType.DeclaredWithdrawIntents,
        auxiliaryLastBlockTimeStamp,
      ),
    ];
  }
}
