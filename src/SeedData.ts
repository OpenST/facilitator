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

import {
  AuxiliaryChain as AuxiliaryChainMosaicConfig, OriginChain as OriginChainMosaicConfig,
} from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import { Config } from './Config/Config';
import Utils from './Utils';
import AuxiliaryChain from './models/AuxiliaryChain';
import ContractEntity, { EntityType } from './models/ContractEntity';
import Gateway from './models/Gateway';
import AuxiliaryChainRepository from './repositories/AuxiliaryChainRepository';
import ContractEntityRepository from './repositories/ContractEntityRepository';
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
   */
  public async populateDb(): Promise<void> {
    const promises = [];
    promises.push(this.populateAuxiliaryChainTable());
    promises.push(this.populateGatewayTable());
    promises.push(this.populateContractEntityTable());
    await Promise.all(promises);
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
   */
  private async populateGatewayTable(): Promise<void> {
    const promises = [];
    promises.push(this.populateGatewayEntry());
    promises.push(this.populateCoGatewayEntry());
    await Promise.all(promises);
  }

  /**
   * Populates seed data for Gateway in gateways table.
   */
  private async populateGatewayEntry(): Promise<void> {
    const gatewayProperties: {
      activated: boolean;
      bounty: BigNumber;
    } = await this.getGatewayProperties();
    const originGateway = new Gateway(
      this.gatewayAddress,
      this.config.facilitator.originChain,
      GatewayType.Origin,
      this.coGatewayAddress,
      this.valueTokenAddress,
      this.anchorAddress,
      gatewayProperties.bounty,
      Zero,
      gatewayProperties.activated,
    );
    await this.gatewayRepository.save(originGateway);
  }

  /**
   * Populates seed data for CoGateway in gateways table.
   */
  private async populateCoGatewayEntry(): Promise<void> {
    const auxiliaryGateway = new Gateway(
      this.coGatewayAddress,
      this.config.facilitator.auxChainId.toString(),
      GatewayType.Auxiliary,
      this.gatewayAddress,
      this.utilityTokenAddress,
      this.coAnchorAddress,
      await this.getCoGatewayBounty(),
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
   * @return Returns auxiliary chain mosaic config.
   */
  private get auxiliaryChainMosaicConfig(): AuxiliaryChainMosaicConfig {
    return this.config.mosaic.auxiliaryChains[this.config.facilitator.auxChainId];
  }

  /**
   * @return Returns origin chain mosaic config.
   */
  private get originChainMosaicConfig(): OriginChainMosaicConfig {
    return this.config.mosaic.originChain;
  }

  /**
   * @return Returns Gateway address.
   */
  private get gatewayAddress(): string {
    return Utils.toChecksumAddress(
      this.auxiliaryChainMosaicConfig.contractAddresses.origin.eip20GatewayAddress,
    );
  }

  /**
   * @return Returns CoGateway address.
   */
  private get coGatewayAddress(): string {
    return Utils.toChecksumAddress(
      this.auxiliaryChainMosaicConfig.contractAddresses.auxiliary.eip20CogatewayAddress,
    );
  }

  /**
   * @return Returns Anchor address.
   */
  private get anchorAddress(): string {
    return Utils.toChecksumAddress(
      this.auxiliaryChainMosaicConfig.contractAddresses.origin.anchorAddress,
    );
  }

  /**
   * @return Returns CoAnchor address.
   */
  private get coAnchorAddress(): string {
    return Utils.toChecksumAddress(
      this.auxiliaryChainMosaicConfig.contractAddresses.auxiliary.anchorAddress,
    );
  }

  /**
   * @return Returns stakePool address.
   */
  private get stakePoolAddress(): string {
    return Utils.toChecksumAddress(
      this.originChainMosaicConfig.contractAddresses.stakePoolAddress,
    );
  }

  private get redeemPoolAddress(): string {
    return Utils.toChecksumAddress(
      this.auxiliaryChainMosaicConfig.contractAddresses.auxiliary.redeemPoolAddress,
    );
  }

  /**
   * @return Returns OstPrime address.
   */
  private get utilityTokenAddress(): string {
    return Utils.toChecksumAddress(
      this.auxiliaryChainMosaicConfig.contractAddresses.auxiliary.utilityTokenAddress,
    );
  }

  /**
   * @return Returns SimpleToken address.
   */
  private get valueTokenAddress(): string {
    return Utils.toChecksumAddress(
      this.originChainMosaicConfig.contractAddresses.valueTokenAddress,
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
