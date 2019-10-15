import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import GatewayConfig from '@openst/mosaic-chains/lib/src/Config/GatewayConfig';

/**
 * It represents contract addresses from mosaic config or token config.
 */
export default class GatewayAddresses {

  public readonly valueTokenAddress: string;

  public readonly baseTokenAddress: string;

  public readonly stakePoolAddress: string;

  public readonly originAnchorAddress: string;

  public readonly auxiliaryAnchorAddress: string;

  public readonly originGatewayAddress: string;

  public readonly auxiliaryGatewayAddress: string;

  public readonly redeemPoolAddress: string;

  public readonly utilityTokenAddress: string;

  public readonly originGatewayOrganizationAddress: string;

  public readonly auxiliaryGatewayOrganizationAddress: string;

  public readonly originAnchorOrganizationAddress: string;

  public readonly auxiliaryAnchorOrganizationAddress: string;

  /**
   * Constructor.
   * @param {string} valueTokenAddress
   * @param {string} baseTokenAddress
   * @param {string} stakePoolAddress
   * @param {string} originAnchorAddress
   * @param {string} originAnchorOrganizationAddress
   * @param {string} auxiliaryAnchorAddress
   * @param {string} auxiliaryAnchorOrganizationAddress
   * @param {string} originGatewayAddress
   * @param {string} auxiliaryGatewayAddress
   * @param {string} redeemPoolAddress
   * @param {string} utilityTokenAddress
   * @param {string} originGatewayOrganizationAddress
   * @param {string} auxiliaryGatewayOrganizationAddress
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
    this.originGatewayAddress = originGatewayAddress;
    this.auxiliaryGatewayAddress = auxiliaryGatewayAddress;
    this.redeemPoolAddress = redeemPoolAddress;
    this.utilityTokenAddress = utilityTokenAddress;
    this.originGatewayOrganizationAddress = originGatewayOrganizationAddress;
    this.auxiliaryGatewayOrganizationAddress = auxiliaryGatewayOrganizationAddress;
  }

  /**
   * It provides GatewayAddresses object based from mosaic config object.
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
   * It provides GatewayAddresses object from gateway config object.
   * @param gatewayConfig GatewayConfig object.
   * @returns GatewayAddresses object.
   */
  public static fromGatewayConfig(gatewayConfig: GatewayConfig): GatewayAddresses {
    if(gatewayConfig) {
      const auxChainId = gatewayConfig.auxChainId;
      return new GatewayAddresses(
        gatewayConfig.originContracts.valueTokenAddress,
        gatewayConfig.originContracts.baseTokenAddress,
        gatewayConfig.originContracts.stakePoolAddress!,
        gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorAddress,
        gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorOrganizationAddress,
        gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorAddress,
        gatewayConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorOrganizationAddress,
        gatewayConfig.originContracts.eip20GatewayAddress,
        gatewayConfig.auxiliaryContracts.eip20CoGatewayAddress,
        gatewayConfig.auxiliaryContracts.redeemPoolAddress!,
        gatewayConfig.auxiliaryContracts.utilityTokenAddress,
        gatewayConfig.originContracts.gatewayOrganizationAddress,
        gatewayConfig.auxiliaryContracts.coGatewayOrganizationAddress,
      );
    }
    throw new Error('Gateway config should not be null');
  }
}
