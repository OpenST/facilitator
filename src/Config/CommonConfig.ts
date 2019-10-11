import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import TokenConfig from '@openst/mosaic-chains/lib/src/Config/TokenConfig';

// todo: change the name of the class.
export class CommonConfig {
  public mosaicConfig?: MosaicConfig;

  public auxChainId?: number;

  public tokenConfig?: TokenConfig;

  /**
   * Constructor.
   * @param mosaicConfig MosaicConfig object.
   * @param auxChainId Chain id of auxiliary chain.
   * @param tokenConfig TokenConfig object.
   */
  private constructor(mosaicConfig?: MosaicConfig, auxChainId?: number, tokenConfig?: TokenConfig) {
    this.mosaicConfig = mosaicConfig;
    this.auxChainId = auxChainId;
    this.tokenConfig = tokenConfig;
  }

  /**
   * It provides CommonConfig object based from mosaicconfig object.
   * @param mosaicConfig Mosaic config object
   * @param auxChainId Chain id of auxiliary chain.
   * @returns CommonConfig object.
   */
  public static getCommonConfigFromMosaicConfig(
    mosaicConfig: MosaicConfig,
    auxChainId: number,
  ): CommonConfig {
    if (mosaicConfig.auxiliaryChains[auxChainId]) {
      return new CommonConfig(mosaicConfig, auxChainId);
    }
    throw new Error(`Auxchain id ${auxChainId} is not present in mosaic config`);
  }

  /**
   * It provides CommonConfig object based from tokenconfig object.
   * @param tokenConfig TokenConfig object.
   * @returns CommonConfig object.
   */
  public static getCommonConfigFromTokenConfig(tokenConfig: TokenConfig): CommonConfig {
    return new CommonConfig(undefined, undefined, tokenConfig);
  }

  /**
   * It provides valuetoken address.
   * @returns valuetoken address.
   */
  public get valueTokenAddress(): string {
    return (
      this.mosaicConfig ? this.mosaicConfig.originChain.contractAddresses.valueTokenAddress
        : this.tokenConfig.originContracts.valueTokenAddress
    );
  }

  /**
   * It provides basetoken address.
   * @returns basetoken address.
   */
  public get baseTokenAddress(): string {
    return (
      this.mosaicConfig ? this.mosaicConfig.auxiliaryChains[this.auxChainId!].contractAddresses.origin.baseTokenAddress
        : this.tokenConfig.originContracts.baseTokenAddress
    );
  }

  /**
   * It provides stakepool address.
   * @returns stakepool address.
   */
  public get stakePoolAddress(): string {
    return (
      this.mosaicConfig ? this.mosaicConfig.originChain.contractAddresses.stakePoolAddress
        : this.tokenConfig.originContracts.stakePoolAddress
    );
  }

  /**
   * It provides origin anchor contract address.
   * @returns origin anchor contract address.
   */
  public get originAnchorAddress(): string {
    return this.mosaicConfig.auxiliaryChains[this.auxChainId!].contractAddresses.origin.anchorAddress;
  }

  /**
   * It provides auxiliary anchor contract address.
   * @returns auxiliary anchor contract address.
   */
  public get auxiliaryAnchorAddress(): string {
    return this.mosaicConfig.auxiliaryChains[this.auxChainId!].contractAddresses.auxiliary.anchorAddress;
  }

  /**
   * It provides origin anchor organization contract address.
   * @returns origin anchor organization contract address.
   */
  public get originAnchorOrganizationAddress(): string {
    return this.mosaicConfig.auxiliaryChains[this.auxChainId!].contractAddresses.origin.anchorOrganizationAddress;
  }

  /**
   * It provides auxiliary anchor organization contract address.
   * @returns auxiliary anchor organization contract address.
   */
  public get auxiliaryAnchorOrganizationAddress(): string {
    return this.mosaicConfig.auxiliaryChains[this.auxChainId!].contractAddresses.auxiliary.anchorOrganizationAddress;
  }

  /**
   * It provides origin gateway contract address.
   * @returns origin gateway contract address
   */
  public get originGatewayAddress(): string {
    return (
      this.mosaicConfig ? this.mosaicConfig.auxiliaryChains[this.auxChainId!].contractAddresses.origin.eip20GatewayAddress
        : this.tokenConfig.originContracts.eip20GatewayAddress
    );
  }

  /**
   * It provides auxiliary gateway contract address.
   * @returns auxiliary gateway contract address.
   */
  public get auxiliaryGatewayAddress(): string {
    return (
      this.mosaicConfig ? this.mosaicConfig.auxiliaryChains[this.auxChainId!].contractAddresses.auxiliary.anchorOrganizationAddress
        : this.tokenConfig.auxiliaryContracts.eip20CoGatewayAddress
    );
  }

  /**
   * It provides redeempool address.
   * @returns redeempool address.
   */
  public get redeemPoolAddress(): string {
    return (
      this.mosaicConfig ? this.mosaicConfig.auxiliaryChains[this.auxChainId!].contractAddresses.auxiliary.redeemPoolAddress
        : this.tokenConfig.auxiliaryContracts.redeemPoolAddress
    );
  }

  /**
   * It provides utility token address.
   * @returns utility token address.
   */
  public get utilityTokenAddress(): string {
    return (
      this.mosaicConfig ? this.mosaicConfig.auxiliaryChains[this.auxChainId!].contractAddresses.auxiliary.utilityTokenAddress
        : this.tokenConfig.auxiliaryContracts.utilityTokenAddress
    );
  }

  /**
   * It provides origin gateway organization contract address.
   * @returns origin gateway organization contract address.
   */
  public get originGatewayOrganizationAddress(): string {
    return (
      this.mosaicConfig ? this.mosaicConfig.auxiliaryChains[this.auxChainId!].contractAddresses.origin.gatewayOrganizationAddress
        : this.tokenConfig.origin.gatewayOrganizationAddress
    );
  }

  /**
   * It provides auxiliary gateway organization contract address.
   * @returns auxiliary gateway organization contract address.
   */
  public get auxiliaryGatewayOrganizationAddress(): string {
    return (
      this.mosaicConfig ? this.mosaicConfig.auxiliaryChains[this.auxChainId!].contractAddresses.auxiliary.coGatewayOrganizationAddress
        : this.tokenConfig.auxiliaryContracts.coGatewayOrganizationAddress
    );
  }
}
