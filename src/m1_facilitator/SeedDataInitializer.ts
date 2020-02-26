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

import Gateway, { GatewayType } from './models/Gateway';
import Anchor from './models/Anchor';
import Repositories from './repositories/Repositories';
import ContractEntity, { EntityType } from '../common/models/ContractEntity';
import Utils from '../common/Utils';

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
   * - Save ERC20Gateway record
   * - Save ERC20goGateway record
   * - Save Origin anchor record
   * - Save auxiliary anchor record
   * - Save contract entity records.
   *
   * @param originWeb3 Instance of origin web3.
   * @param auxiliaryWeb3 Instance of auxiliary web3.
   * @param gatewayAddresses Gateway address.
   */
  public async initialize(
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    gatewayAddresses: string,
  ): Promise<void> {
    const erc20Gateway = Mosaic.interacts.getERC20Gateway(originWeb3, gatewayAddresses);
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

    const originLatestAnchoredStateRootBlockHeight = await originAnchorInstance.methods
      .getLatestStateRootBlockNumber().call();
    const auxiliaryLatestAnchoredStateRootBlockHeight = await auxiliaryAnchorInstance.methods
      .getLatestStateRootBlockNumber().call();

    const originGateway = new Gateway(
      Gateway.getGlobalAddress(gatewayAddresses),
      Gateway.getGlobalAddress(cogatewayAddress),
      GatewayType.ERC20,
      Anchor.getGlobalAddress(originAnchorAddress),
      new BigNumber(0),
    );

    const auxiliaryGateway = new Gateway(
      Gateway.getGlobalAddress(cogatewayAddress),
      Gateway.getGlobalAddress(gatewayAddresses),
      GatewayType.ERC20,
      Anchor.getGlobalAddress(auxiliaryAnchorAddress),
      new BigNumber(0),
    );

    const originAnchor = new Anchor(
      Anchor.getGlobalAddress(originAnchorAddress),
      new BigNumber(originLatestAnchoredStateRootBlockHeight),
    );

    const auxiliaryAnchor = new Anchor(
      Anchor.getGlobalAddress(auxiliaryAnchorAddress),
      new BigNumber(auxiliaryLatestAnchoredStateRootBlockHeight),
    );

    const currentTimeStamp = Utils.getCurrentTimestamp();


    const contractEntities = SeedDataInitializer.getContractEntities(
      gatewayAddresses,
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

    await this.repositories.gatewayRepository.save(originGateway);
    await this.repositories.gatewayRepository.save(auxiliaryGateway);

    await this.repositories.anchorRepository.save(originAnchor);
    await this.repositories.anchorRepository.save(auxiliaryAnchor);
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
