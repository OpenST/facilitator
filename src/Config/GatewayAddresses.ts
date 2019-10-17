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

  public readonly eip20GatewayOrganizationAddress: string;

  public readonly eip20CoGatewayOrganizationAddress: string;

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
   * @param originGatewayAddress Address of gateway address contract at origin.
   * @param auxiliaryGatewayAddress Address of cogateway contract at auxiliary.
   * @param redeemPoolAddress Address of redeem pool contract address.
   * @param utilityTokenAddress Address of utilitytoken address.
   * @param originGatewayOrganizationAddress Address of organization contract of gateway
   *  at origin.
   * @param auxiliaryGatewayOrganizationAddress Address of organization contract of cogateway
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
    originGatewayAddress: string,
    auxiliaryGatewayAddress: string,
    redeemPoolAddress: string,
    utilityTokenAddress: string,
    originGatewayOrganizationAddress: string,
    auxiliaryGatewayOrganizationAddress: string,
  ) {
    this.valueTokenAddress = valueTokenAddress;
    this.baseTokenAddress = baseTokenAddress;
    this.stakePoolAddress = stakePoolAddress;
    this.originAnchorAddress = originAnchorAddress;
    this.originAnchorOrganizationAddress = originAnchorOrganizationAddress;
    this.auxiliaryAnchorAddress = auxiliaryAnchorAddress;
    this.auxiliaryAnchorOrganizationAddress = auxiliaryAnchorOrganizationAddress;
    this.eip20GatewayAddress = originGatewayAddress;
    this.eip20CoGatewayAddress = auxiliaryGatewayAddress;
    this.redeemPoolAddress = redeemPoolAddress;
    this.utilityTokenAddress = utilityTokenAddress;
    this.eip20GatewayOrganizationAddress = originGatewayOrganizationAddress;
    this.eip20CoGatewayOrganizationAddress = auxiliaryGatewayOrganizationAddress;
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
      return new GatewayAddresses(
        mosaicConfig.originChain.contractAddresses.valueTokenAddress,
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.baseTokenAddress,
        mosaicConfig.originChain.contractAddresses.stakePoolAddress,
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorAddress,
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorOrganizationAddress,
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorAddress,
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorOrganizationAddress,
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.eip20GatewayAddress,
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.eip20CoGatewayAddress,
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.redeemPoolAddress,
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.utilityTokenAddress,
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.gatewayOrganizationAddress,
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.coGatewayOrganizationAddress,
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
      return new GatewayAddresses(
        gatewayConfig.originContracts.valueTokenAddress,
        gatewayConfig.originContracts.baseTokenAddress,
        gatewayConfig.originContracts.stakePoolAddress ||
          gatewayConfig.mosaicConfig.originChain.contractAddresses.stakePoolAddress,
        gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorAddress,
        gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorOrganizationAddress,
        gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorAddress,
        gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorOrganizationAddress,
        gatewayConfig.originContracts.eip20GatewayAddress,
        gatewayConfig.auxiliaryContracts.eip20CoGatewayAddress,
        gatewayConfig.auxiliaryContracts.redeemPoolAddress ||
          gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.redeemPoolAddress,
        gatewayConfig.auxiliaryContracts.utilityTokenAddress,
        gatewayConfig.originContracts.gatewayOrganizationAddress,
        gatewayConfig.auxiliaryContracts.coGatewayOrganizationAddress,
      );
    }
    throw new Error('Gateway config should not be null');
  }
}

