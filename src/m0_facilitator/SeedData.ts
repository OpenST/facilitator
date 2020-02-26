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

/* eslint-disable import/no-unresolved */

import BigNumber from 'bignumber.js';

import { interacts } from '@openst/mosaic-contracts';
import { EIP20CoGateway } from '@openst/mosaic-contracts/dist/interacts/EIP20CoGateway';
import { EIP20Gateway } from '@openst/mosaic-contracts/dist/interacts/EIP20Gateway';

import { Config } from './Config/Config';
import Utils from './Utils';
import AuxiliaryChain from './models/AuxiliaryChain';
import ContractEntity, { EntityType } from '../common/models/ContractEntity';
import Gateway from './models/Gateway';
import AuxiliaryChainRepository from './repositories/AuxiliaryChainRepository';
import ContractEntityRepository from '../common/repositories/ContractEntityRepository';
import GatewayRepository, { GatewayType } from './repositories/GatewayRepository';

const Zero = new BigNumber('0');

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * SeedData provides functionality to populate seed data in db tables.
 */
export default class SeedData {
  private readonly config: Config;

  private gatewayRepository: GatewayRepository;

  private auxiliaryChainRepository: AuxiliaryChainRepository;

  private contractEntityRepository: ContractEntityRepository;

  private currentTimestamp: BigNumber;

  /**
   * @param config Config.
   * @param gatewayRepository GatewayRepository.
   * @param auxiliaryChainRepository AuxiliaryChainRepository.
   * @param contractEntityRepository ContractEntityRepository.
   * @param currentTimestamp current Timestamp.
   */
  public constructor(
    config: Config,
    gatewayRepository: GatewayRepository,
    auxiliaryChainRepository: AuxiliaryChainRepository,
    contractEntityRepository: ContractEntityRepository,
    currentTimestamp?: BigNumber,
  ) {
    this.config = config;
    this.gatewayRepository = gatewayRepository;
    this.auxiliaryChainRepository = auxiliaryChainRepository;
    this.contractEntityRepository = contractEntityRepository;
    this.currentTimestamp = currentTimestamp || Utils.getCurrentTimestamp();
  }

  /**
   * Populates seed data in database tables.
   * @returns Bounty amount of eip20Gateway and eip20CoGateway.
   */
  public async populateDb(): Promise<{
    eip20GatewayBounty: BigNumber;
    eip20CoGatewayBounty: BigNumber;
  }> {
    const promises = [];
    promises.push(this.populateAuxiliaryChainTable());

    const gatewayProperties: {
      activated: boolean;
      bounty: BigNumber;
    } = await this.getGatewayProperties();
    const eip20CoGatewayBounty = await this.getCoGatewayBounty();
    promises.push(
      this.populateGatewayTable(
        gatewayProperties.activated,
        gatewayProperties.bounty,
        eip20CoGatewayBounty,
      ),
    );

    promises.push(this.populateContractEntityTable());
    await Promise.all(promises);

    return {
      eip20GatewayBounty: gatewayProperties.bounty,
      eip20CoGatewayBounty,
    };
  }

  /**
   * Populates seed data in auxiliary_chains table.
   */
  private async populateAuxiliaryChainTable(): Promise<void> {
    const auxiliaryChain = new AuxiliaryChain(
      this.config.facilitator.auxChainId,
      this.config.facilitator.originChain,
      this.gatewayAddress,
      this.coGatewayAddress,
      this.anchorAddress,
      this.coAnchorAddress,
      Zero,
      Zero,
    );
    await this.auxiliaryChainRepository.save(auxiliaryChain);
  }

  /**
   * Populates seed data in gateways table.
   * @param activationStatus Activation status of EIP20Gateway.
   * @param eip20GatewayBounty Bounty for EIP20Gateway.
   * @param eip20CoGatewayBounty Bounty for EIP20CoGateway.
   */
  private async populateGatewayTable(
    activationStatus: boolean,
    eip20GatewayBounty: BigNumber,
    eip20CoGatewayBounty: BigNumber,
  ): Promise<void> {
    const promises = [];
    promises.push(this.populateGatewayEntry(activationStatus, eip20GatewayBounty));
    promises.push(this.populateCoGatewayEntry(eip20CoGatewayBounty));
    await Promise.all(promises);
  }

  /**
   * Populates seed data for Gateway in gateways table.
   * @param activationStatus Activation status of EIP20CoGateway.
   * @param eip20GatewayBounty Bounty for EIP20Gateway.
   */
  private async populateGatewayEntry(
    activationStatus: boolean,
    eip20GatewayBounty: BigNumber,
  ): Promise<void> {
    const originGateway = new Gateway(
      this.gatewayAddress,
      this.config.facilitator.originChain,
      GatewayType.Origin,
      this.coGatewayAddress,
      this.valueTokenAddress,
      this.anchorAddress,
      eip20GatewayBounty,
      Zero,
      activationStatus,
    );
    await this.gatewayRepository.save(originGateway);
  }

  /**
   * Populates seed data for CoGateway in gateways table.
   * @param eip20CoGatwayBounty Bounty for EIP20CoGateway.
   */
  private async populateCoGatewayEntry(eip20CoGatwayBounty: BigNumber): Promise<void> {
    const auxiliaryGateway = new Gateway(
      this.coGatewayAddress,
      this.config.facilitator.auxChainId.toString(),
      GatewayType.Auxiliary,
      this.gatewayAddress,
      this.utilityTokenAddress,
      this.coAnchorAddress,
      eip20CoGatwayBounty,
      Zero,
      undefined,
    );
    await this.gatewayRepository.save(auxiliaryGateway);
  }

  /**
   * Populates seed data in contract_entities table.
   */
  private async populateContractEntityTable(): Promise<void> {
    const contractAddressEventTypesMap: Record<string, EntityType[]> = {
      [this.stakePoolAddress]: [EntityType.StakeRequesteds],
      [this.redeemPoolAddress]: [EntityType.RedeemRequesteds],
      [this.gatewayAddress]: [
        // Stake & mint entities
        EntityType.StakeIntentDeclareds,
        EntityType.StakeProgresseds,
        // Redeem & Unstake entities
        EntityType.RedeemIntentConfirmeds,
        EntityType.UnstakeProgresseds,
        EntityType.GatewayProvens,
      ],
      [this.coAnchorAddress]: [EntityType.StateRootAvailables],
      [this.anchorAddress]: [EntityType.StateRootAvailables],
      [this.coGatewayAddress]: [
        // Stake & Mint entities
        EntityType.StakeIntentConfirmeds,
        EntityType.MintProgresseds,
        EntityType.GatewayProvens,
        // Redeem & Unstake entities
        EntityType.RedeemIntentDeclareds,
        EntityType.RedeemProgresseds,
      ],
    };
    const promises: any = [];
    const contractAddresses = Object.keys(contractAddressEventTypesMap);
    for (let i = 0; i < contractAddresses.length; i += 1) {
      const contractAddress = Utils.toChecksumAddress(contractAddresses[i]);
      const eventTypes = contractAddressEventTypesMap[contractAddress];
      for (let j = 0; eventTypes.length; j += 1) {
        if (!eventTypes[j]) { break; }
        promises.push(this.contractEntityRepository.save(new ContractEntity(
          contractAddress,
          eventTypes[j],
          this.currentTimestamp,
        )));
      }
    }
    await Promise.all(promises);
  }

  /**
   * @return Returns Gateway address.
   */
  private get gatewayAddress(): string {
    return Utils.toChecksumAddress(
      this.config.gatewayAddresses.eip20GatewayAddress,
    );
  }

  /**
   * @return Returns CoGateway address.
   */
  private get coGatewayAddress(): string {
    return Utils.toChecksumAddress(
      this.config.gatewayAddresses.eip20CoGatewayAddress,
    );
  }

  /**
   * @return Returns Anchor address.
   */
  private get anchorAddress(): string {
    return Utils.toChecksumAddress(
      this.config.gatewayAddresses.originAnchorAddress,
    );
  }

  /**
   * @return Returns CoAnchor address.
   */
  private get coAnchorAddress(): string {
    return Utils.toChecksumAddress(
      this.config.gatewayAddresses.auxiliaryAnchorAddress,
    );
  }

  /**
   * @return Returns stake pool address.
   */
  private get stakePoolAddress(): string {
    return Utils.toChecksumAddress(
      this.config.gatewayAddresses.stakePoolAddress,
    );
  }

  /**
   * @return Returns redeem pool address.
   */
  private get redeemPoolAddress(): string {
    return Utils.toChecksumAddress(
      this.config.gatewayAddresses.redeemPoolAddress,
    );
  }

  /**
   * @return Returns utility token address.
   */
  private get utilityTokenAddress(): string {
    return Utils.toChecksumAddress(
      this.config.gatewayAddresses.utilityTokenAddress,
    );
  }

  /**
   * @return Returns value token address.
   */
  private get valueTokenAddress(): string {
    return Utils.toChecksumAddress(
      this.config.gatewayAddresses.valueTokenAddress,
    );
  }

  /**
   * @return Returns properties of Gateway contract from chain.
   */
  private async getGatewayProperties(): Promise<{activated: boolean; bounty: BigNumber}> {
    const eip20Gateway: EIP20Gateway = interacts.getEIP20Gateway(
      this.config.originWeb3,
      this.gatewayAddress,
    );
    return Promise.resolve({
      activated: await eip20Gateway.methods.activated().call(),
      bounty: new BigNumber(await eip20Gateway.methods.bounty().call()),
    });
  }

  /**
   * @return Returns bounty of CoGateway contract from chain.
   */
  private async getCoGatewayBounty(): Promise<BigNumber> {
    const eip20CoGateway: EIP20CoGateway = interacts.getEIP20CoGateway(
      this.config.auxiliaryWeb3,
      this.coGatewayAddress,
    );
    return new BigNumber(await eip20CoGateway.methods.bounty().call());
  }
}
