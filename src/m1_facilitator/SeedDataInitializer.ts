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
import * as Mosaic from 'Mosaic';
import BigNumber from 'bignumber.js';

import Anchor from './models/Anchor';
import Gateway, { GatewayType } from './models/Gateway';
import Repositories from './repositories/Repositories';
import ContractEntity, { EntityType } from '../common/models/ContractEntity';
import Utils from '../common/Utils';

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
   * Generate and save records that should be populated as seed data.
   * - Saves erc20Gateway record.
   * - Saves erc20Cogateway record.
   * - Saves origin anchor record.
   * - Saves auxiliary anchor record.
   * - Save contract entity records.
   *
   * @param originWeb3 Instance of origin web3.
   * @param auxiliaryWeb3 Instance of auxiliary web3.
   * @param erc20GatewayAddress ERC20 Gateway address.
   */
  public async initialize(
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    erc20GatewayAddress: string,
  ): Promise<void> {
    const erc20Gateway = Mosaic.interacts.getERC20Gateway(originWeb3, erc20GatewayAddress);
    const cogatewayAddress = await erc20Gateway.methods.messageOutbox().call();
    const erc20Cogateway = Mosaic.interacts.getERC20Cogateway(
      auxiliaryWeb3,
      cogatewayAddress,
    );

    const originAnchorAddress = await erc20Gateway.methods.stateRootProvider().call();
    const originAnchorInstance = Mosaic.interacts.getAnchor(
      originWeb3,
      originAnchorAddress,
    );

    const auxiliaryAnchorAddress = await erc20Cogateway.methods.stateRootProvider().call();
    const auxiliaryAnchorInstance = Mosaic.interacts.getAnchor(
      auxiliaryWeb3,
      auxiliaryAnchorAddress,
    );

    const auxiliaryLatestAnchoredStateRootBlockHeight = await originAnchorInstance.methods
      .getLatestStateRootBlockNumber().call();
    const originLatestAnchoredStateRootBlockHeight = await auxiliaryAnchorInstance.methods
      .getLatestStateRootBlockNumber().call();

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

    const currentTimeStamp = Utils.getCurrentTimestampInMillis();


    const contractEntities = SeedDataInitializer.getContractEntities(
      erc20GatewayAddress,
      currentTimeStamp,
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
    const gatewayRecord = await this.repositories.gatewayRepository.get(gatewayGA);

    return (gatewayRecord !== null);
  }

  /**
   * Returns list of contract entities.
   *
   * @param gatewayAddresses Gateway address.
   * @param currentTimeStamp Current timestamp.
   * @param cogatewayAddress Cogateway address.
   * @param originAnchorAddress Origin anchor address.
   * @param auxiliaryAnchorAddress Auxiliary anchor address.
   */
  private static getContractEntities(
    gatewayAddresses: string,
    currentTimeStamp: BigNumber,
    cogatewayAddress: string,
    originAnchorAddress: string,
    auxiliaryAnchorAddress: string,
  ) {
    return [
      new ContractEntity(
        gatewayAddresses,
        EntityType.ProvenGateways,
        currentTimeStamp,
      ),
      new ContractEntity(
        cogatewayAddress,
        EntityType.ProvenGateways,
        currentTimeStamp,
      ),
      new ContractEntity(
        originAnchorAddress,
        EntityType.AvailableStateRoots,
        currentTimeStamp,
      ),
      new ContractEntity(
        auxiliaryAnchorAddress,
        EntityType.AvailableStateRoots,
        currentTimeStamp,
      ),
      new ContractEntity(
        gatewayAddresses,
        EntityType.DeclaredDepositIntents,
        currentTimeStamp,
      ),
      new ContractEntity(
        cogatewayAddress,
        EntityType.ConfirmedDepositIntents,
        currentTimeStamp,
      ),
      new ContractEntity(
        cogatewayAddress,
        EntityType.CreatedUtilityTokens,
        currentTimeStamp,
      ),
      new ContractEntity(
        gatewayAddresses,
        EntityType.ConfirmedWithdrawIntents,
        currentTimeStamp,
      ),
      new ContractEntity(
        cogatewayAddress,
        EntityType.DeclaredWithdrawIntents,
        currentTimeStamp,
      ),
    ];
  }
}
