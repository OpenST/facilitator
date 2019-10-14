import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import TokenConfig from '@openst/mosaic-chains/lib/src/Config/TokenConfig';

/**
 * It represents contract addresses from mosaic config or token config.
 */
export default class TokenAddresses {

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
   * @param mosaicConfig MosaicConfig object.
   * @param auxChainId Chain id of auxiliary chain.
   * @param tokenConfig TokenConfig object.
   */
  private constructor(
    valueTokenAddress: string,
    baseTokenAddress: string,
    stakePoolAddress: string,
    originAnchorAddress: string,
    originAnchorOrganizationAddress: string,
    auxiliaryAnchorOrganizationAddress: string,
    auxiliaryAnchorAddress: string,
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
   * It provides TokenAddresses object based from mosaic config object.
   * @param mosaicConfig Mosaic config object
   * @param auxChainId Chain id of auxiliary chain.
   * @returns TokenAddresses object.
   */
  public static fromMosaicConfig(
    mosaicConfig: MosaicConfig,
    auxChainId: number,
  ): TokenAddresses {
    if (mosaicConfig.auxiliaryChains[auxChainId]) {
      return new TokenAddresses(
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
        mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.coGatewayOrganizationAddress
      );
    }
    throw new Error(`Auxchain id ${auxChainId} is not present in mosaic config`);
  }

  /**
   * It provides TokenAddresses object based from tokenconfig object.
   * @param tokenConfig TokenConfig object.
   * @returns TokenAddresses object.
   */
  public static fromTokenConfig(tokenConfig: TokenConfig): TokenAddresses {
    if(tokenConfig !== null) {
      const auxChainId = tokenConfig.auxChainId;
      return new TokenAddresses(
        tokenConfig.originContracts.valueTokenAddress,
        tokenConfig.originContracts.baseTokenAddress,
        tokenConfig.originContracts.stakePoolAddress!,
        tokenConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorAddress,
        tokenConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.origin.anchorOrganizationAddress,
        tokenConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorAddress,
        tokenConfig.mosaicConfig.auxiliaryChains[auxChainId].contractAddresses.auxiliary.anchorOrganizationAddress,
        tokenConfig.originContracts.eip20GatewayAddress,
        tokenConfig.auxiliaryContracts.eip20CoGatewayAddress,
        tokenConfig.auxiliaryContracts.redeemPoolAddress!,
        tokenConfig.auxiliaryContracts.utilityTokenAddress,
        tokenConfig.originContracts.gatewayOrganizationAddress,
        tokenConfig.auxiliaryContracts.coGatewayOrganizationAddress
      );
    }
    throw new Error('Token config should not be null');
  }
}
