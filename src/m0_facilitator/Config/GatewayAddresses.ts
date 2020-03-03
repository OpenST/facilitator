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


import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import GatewayConfig from '@openst/mosaic-chains/lib/src/Config/GatewayConfig';
import Utils from '../Utils';

/**
 * It represents contract addresses of mosaic config or gateway config.
 */
export default class GatewayAddresses {
  public readonly valueTokenAddress: string;

  public readonly baseTokenAddress: string;

  public readonly stakePoolAddress: string;

  public readonly originAnchorAddress: string;

  public readonly auxiliaryAnchorAddress: string;

  public readonly eip20GatewayAddress: string;

  public readonly eip20CoGatewayAddress: string;

  public readonly redeemPoolAddress: string;

  public readonly utilityTokenAddress: string;

  public readonly gatewayOrganizationAddress: string;

  public readonly coGatewayOrganizationAddress: string;

  public readonly originAnchorOrganizationAddress: string;

  public readonly auxiliaryAnchorOrganizationAddress: string;

  /**
   * Constructor.
   * @param valueTokenAddress Address of valuetoken contract.
   * @param baseTokenAddress Address of basetoken contract.
   * @param stakePoolAddress Address of StakePool contract.
   * @param originAnchorAddress Address of anchor contract at origin chain.
   * @param originAnchorOrganizationAddress Address of organization contract of
   *  anchor at origin chain.
   * @param auxiliaryAnchorAddress Address of anchor contract at auxiliary chain.
   * @param auxiliaryAnchorOrganizationAddress Address of organization contract of anchor
   *  at auxiliary chain.
   * @param eip20GatewayAddress Address of gateway address contract at origin.
   * @param eip20CoGatewayAddress Address of cogateway contract at auxiliary.
   * @param redeemPoolAddress Address of redeem pool contract address.
   * @param utilityTokenAddress Address of utilitytoken address.
   * @param gatewayOrganizationAddress Address of organization contract of gateway
   *  at origin.
   * @param coGatewayOrganizationAddress Address of organization contract of cogateway
   *  at auxiliary.
   */
  private constructor(
    valueTokenAddress: string,
    baseTokenAddress: string,
    stakePoolAddress: string,
    originAnchorAddress: string,
    originAnchorOrganizationAddress: string,
    auxiliaryAnchorAddress: string,
    auxiliaryAnchorOrganizationAddress: string,
    eip20GatewayAddress: string,
    eip20CoGatewayAddress: string,
    redeemPoolAddress: string,
    utilityTokenAddress: string,
    gatewayOrganizationAddress: string,
    coGatewayOrganizationAddress: string,
  ) {
    this.valueTokenAddress = Utils.toChecksumAddress(valueTokenAddress);
    this.baseTokenAddress = Utils.toChecksumAddress(baseTokenAddress);
    this.stakePoolAddress = Utils.toChecksumAddress(stakePoolAddress);
    this.originAnchorAddress = Utils.toChecksumAddress(originAnchorAddress);
    this.originAnchorOrganizationAddress = Utils.toChecksumAddress(
      originAnchorOrganizationAddress,
    );
    this.auxiliaryAnchorAddress = Utils.toChecksumAddress(auxiliaryAnchorAddress);
    this.auxiliaryAnchorOrganizationAddress = Utils.toChecksumAddress(
      auxiliaryAnchorOrganizationAddress,
    );
    this.eip20GatewayAddress = Utils.toChecksumAddress(eip20GatewayAddress);
    this.eip20CoGatewayAddress = Utils.toChecksumAddress(eip20CoGatewayAddress);
    this.redeemPoolAddress = Utils.toChecksumAddress(redeemPoolAddress);
    this.utilityTokenAddress = Utils.toChecksumAddress(utilityTokenAddress);
    this.gatewayOrganizationAddress = Utils.toChecksumAddress(gatewayOrganizationAddress);
    this.coGatewayOrganizationAddress = Utils.toChecksumAddress(coGatewayOrganizationAddress);
  }

  /**
   * It returns GatewayAddresses object after parsing mosaic config object.
   * @param mosaicConfig Mosaic config object
   * @param auxChainId Chain id of auxiliary chain.
   * @returns GatewayAddresses object.
   */
  public static fromMosaicConfig(
    mosaicConfig: MosaicConfig,
    auxChainId: number,
  ): GatewayAddresses {
    if (mosaicConfig.auxiliaryChains[auxChainId]) {
      const originAddresses = mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin;
      const auxiliaryAddresses = mosaicConfig.auxiliaryChains[auxChainId]
        .contractAddresses.auxiliary;
      const originLibraryAddresses = mosaicConfig.originChain.contractAddresses;
      return new GatewayAddresses(
        originLibraryAddresses.valueTokenAddress,
        originAddresses.baseTokenAddress,
        originLibraryAddresses.stakePoolAddress,
        originAddresses.anchorAddress,
        originAddresses.anchorOrganizationAddress,
        auxiliaryAddresses.anchorAddress,
        auxiliaryAddresses.anchorOrganizationAddress,
        originAddresses.eip20GatewayAddress,
        auxiliaryAddresses.eip20CoGatewayAddress,
        auxiliaryAddresses.redeemPoolAddress,
        auxiliaryAddresses.utilityTokenAddress,
        originAddresses.gatewayOrganizationAddress,
        auxiliaryAddresses.coGatewayOrganizationAddress,
      );
    }
    throw new Error(`Auxchain id ${auxChainId} is not present in mosaic config`);
  }

  /**
   * It returns GatewayAddresses object after parsing gateway config object.
   * @param gatewayConfig GatewayConfig object.
   * @returns GatewayAddresses object.
   */
  public static fromGatewayConfig(gatewayConfig: GatewayConfig): GatewayAddresses {
    if (gatewayConfig) {
      const { auxChainId } = gatewayConfig;
      const originAddresses = gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId]
        .contractAddresses.origin;
      const auxiliaryAddresses = gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId]
        .contractAddresses.auxiliary;
      const originLibraryAddresses = gatewayConfig.mosaicConfig.originChain.contractAddresses;
      return new GatewayAddresses(
        gatewayConfig.originContracts.valueTokenAddress,
        gatewayConfig.originContracts.baseTokenAddress,
        gatewayConfig.originContracts.stakePoolAddress
          || originLibraryAddresses.stakePoolAddress,
        originAddresses.anchorAddress,
        originAddresses.anchorOrganizationAddress,
        auxiliaryAddresses.anchorAddress,
        auxiliaryAddresses.anchorOrganizationAddress,
        gatewayConfig.originContracts.eip20GatewayAddress,
        gatewayConfig.auxiliaryContracts.eip20CoGatewayAddress,
        gatewayConfig.auxiliaryContracts.redeemPoolAddress
          || auxiliaryAddresses.redeemPoolAddress,
        gatewayConfig.auxiliaryContracts.utilityTokenAddress,
        gatewayConfig.originContracts.gatewayOrganizationAddress,
        gatewayConfig.auxiliaryContracts.coGatewayOrganizationAddress,
      );
    }
    throw new Error('Gateway config should not be null');
  }
}
