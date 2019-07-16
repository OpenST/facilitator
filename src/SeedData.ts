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

import BigNumber from 'bignumber.js';
import { interacts } from '@openst/mosaic-contracts';
import { EIP20Gateway } from '@openst/mosaic-contracts/dist/interacts/EIP20Gateway';
import { EIP20CoGateway } from '@openst/mosaic-contracts/dist/interacts/EIP20CoGateway';

import { OriginChain as OriginChainMosaicConfig, AuxiliaryChain as AuxiliaryChainMosaicConfig } from './MosaicConfig';
import { Config } from './Config/Config';
import GatewayRepository, { GatewayType } from './repositories/GatewayRepository';
import AuxiliaryChainRepository from './repositories/AuxiliaryChainRepository';
import ContractEntityRepository from './repositories/ContractEntityRepository';
import AuxiliaryChain from './models/AuxiliaryChain';
import Gateway from './models/Gateway';
import ContractEntity, { EntityType } from './models/ContractEntity';

/**
 * SeedData provides functionality to populate seed data in db tables.
 */
export default class SeedData {
  private readonly config: Config;

  private gatewayRepository: GatewayRepository;

  private auxiliaryChainRepository: AuxiliaryChainRepository;

  private contractEntityRepository: ContractEntityRepository;

  /**
   * @param config Config.
   * @param gatewayRepository GatewayRepository.
   * @param auxiliaryChainRepository AuxiliaryChainRepository.
   * @param contractEntityRepository ContractEntityRepository.
   */
  public constructor(
    config: Config,
    gatewayRepository: GatewayRepository,
    auxiliaryChainRepository: AuxiliaryChainRepository,
    contractEntityRepository: ContractEntityRepository
  ) {
    this.config = config;
    this.gatewayRepository = gatewayRepository;
    this.auxiliaryChainRepository = auxiliaryChainRepository;
    this.contractEntityRepository = contractEntityRepository;
    this.populateContractEntityTable = this.populateContractEntityTable.bind(this);
  }

  /**
   * Populates seed data in database tables.
   * @return {Promise<void>}
   */
  public async populateDb(): Promise<void> {
    const promises = [];
    promises.push(this.populateAuxiliaryChainTable());
    promises.push(this.populateGatewayTable());
    promises.push(this.populateContractEntityTable());
    await Promise.all(promises);
    return Promise.resolve();
  }

  /**
   * Populates seed data in auxiliary_chains table.
   * @return {Promise<void>}
   */
  private async populateAuxiliaryChainTable(): Promise<void> {
    const auxiliaryChain = new AuxiliaryChain(
      this.config.facilitator.auxChainId,
      this.config.facilitator.originChain,
      this.gatewayAddress,
      this.coGatewayAddress,
      this.anchorAddress,
      this.coAnchorAddress,
      this.zeroBn,
      this.zeroBn,
    );
    await this.auxiliaryChainRepository.save(auxiliaryChain);
    return Promise.resolve();
  }

  /**
   * Populates seed data in gateways table.
   * @return {Promise<void>}
   */
  private async populateGatewayTable(): Promise<void> {
    const promises = [];
    promises.push(this.populateGatewayEntry());
    promises.push(this.populateCoGatewayEntry());
    await Promise.all(promises);
    return Promise.resolve();
  }

  /**
   * Populates seed data for Gateway in gateways table.
   * @return {Promise<void>}
   */
  private async populateGatewayEntry(): Promise<void> {
    const gatewayProperties: {activated: boolean; bounty: BigNumber} = await this.getGatewayProperties();
    const originGateway = new Gateway(
      this.gatewayAddress!,
      this.config.facilitator.originChain,
      GatewayType.Origin,
      this.coGatewayAddress,
      this.simpleTokenAddress,
      this.anchorAddress,
      gatewayProperties.bounty,
      gatewayProperties.activated,
      this.zeroBn,
    );
    await this.gatewayRepository.save(originGateway);
    return Promise.resolve();
  }

  /**
   * Populates seed data for CoGateway in gateways table.
   * @return {Promise<void>}
   */
  private async populateCoGatewayEntry(): Promise<void> {
    const auxiliaryGateway = new Gateway(
      this.coGatewayAddress!,
      this.config.facilitator.auxChainId.toString(),
      GatewayType.Auxiliary,
      this.gatewayAddress,
      this.ostPrimeAddress,
      this.coAnchorAddress,
      await this.getCoGatewayBounty(),
      undefined,
      this.zeroBn,
    );
    await this.gatewayRepository.save(auxiliaryGateway);
    return Promise.resolve();
  }

  /**
   * Populates seed data in contract_entities table.
   * @return {Promise<void>}
   */
  private async populateContractEntityTable(): Promise<void> {
    const contractAddressEventTypesMap: Record<string, EntityType[]> = {
      [this.ostComposerAddress!]: [EntityType.StakeRequesteds],
      [this.gatewayAddress!]: [
        EntityType.StakeIntentDeclareds,
        EntityType.StakeProgresseds,
      ],
      [this.coAnchorAddress!]: [EntityType.StateRootAvailables],
      [this.coGatewayAddress!]: [
        EntityType.StakeIntentConfirmeds,
        EntityType.MintProgresseds,
        EntityType.GatewayProvens,
      ],
    };
    const promises: any = [];
    const contractAddresses = Object.keys(contractAddressEventTypesMap);
    for (let i = 0; i < contractAddresses.length; i++) {
      const contractAddress = contractAddresses[i];
      const eventTypes = contractAddressEventTypesMap[contractAddress];
      for (let j = 0; eventTypes.length; j++) {
        if (!eventTypes[j]) { break; }
        promises.push(this.contractEntityRepository.save(new ContractEntity(
          contractAddress,
          eventTypes[j],
          this.zeroBn,
        )));
      }
    }
    await Promise.all(promises);
    return Promise.resolve();
  }

  /**
   * @returns Returns auxiliary chain mosaic config.
   */
  private get auxiliaryChainMosaicConfig(): AuxiliaryChainMosaicConfig {
    return this.config.mosaic.auxiliaryChains[this.config.facilitator.auxChainId];
  }

  /**
   * @returns Returns origin chain mosaic config.
   */
  private get originChainMosaicConfig(): OriginChainMosaicConfig {
    return this.config.mosaic.originChain;
  }

  /**
   * @returns Returns Gateway address.
   */
  private get gatewayAddress(): string | undefined {
    return this.auxiliaryChainMosaicConfig.contractAddresses.origin.ostEIP20GatewayAddress;
  }

  /**
   * @returns Returns CoGateway address.
   */
  private get coGatewayAddress(): string | undefined {
    return this.auxiliaryChainMosaicConfig.contractAddresses.auxiliary.ostEIP20CogatewayAddress;
  }

  /**
   * @returns Returns Anchor address.
   */
  private get anchorAddress(): string | undefined {
    return this.auxiliaryChainMosaicConfig.contractAddresses.origin.anchorAddress;
  }

  /**
   * @returns Returns CoAnchor address.
   */
  private get coAnchorAddress(): string | undefined {
    return this.auxiliaryChainMosaicConfig.contractAddresses.auxiliary.anchorAddress;
  }

  /**
   * @returns Returns OstComposer address.
   */
  private get ostComposerAddress(): string | undefined {
    return this.originChainMosaicConfig.contractAddresses.ostComposerAddress;
  }

  /**
   * @returns Returns OstPrime address.
   */
  private get ostPrimeAddress(): string | undefined {
    return this.auxiliaryChainMosaicConfig.contractAddresses.auxiliary.ostPrimeAddress;
  }

  /**
   * @returns Returns SimpleToken address.
   */
  private get simpleTokenAddress(): string | undefined {
    return this.originChainMosaicConfig.contractAddresses.simpleTokenAddress;
  }

  private get zeroBn(): BigNumber {
    return new BigNumber('0');
  }

  /**
   * @returns Returns properties of Gateway contract from chain.
   */
  private async getGatewayProperties(): Promise<{activated: boolean; bounty: BigNumber}> {
    const eip20Gateway: EIP20Gateway = interacts.getEIP20Gateway(this.config.originWeb3, this.gatewayAddress);
    return Promise.resolve({
      activated: await eip20Gateway.methods.activated().call(),
      bounty: new BigNumber(await eip20Gateway.methods.bounty().call()),
    });
  }

  /**
   * @returns Returns bounty of CoGateway contract from chain.
   */
  private async getCoGatewayBounty(): Promise<BigNumber> {
    const eip20CoGateway: EIP20CoGateway = interacts.getEIP20CoGateway(this.config.auxiliaryWeb3, this.coGatewayAddress);
    return await new BigNumber(await eip20CoGateway.methods.bounty().call());
  }
}
