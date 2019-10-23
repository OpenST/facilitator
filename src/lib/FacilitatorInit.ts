import MosaicConfig from '@openst/mosaic-chains/lib/src/Config/MosaicConfig';
import GatewayConfig from '@openst/mosaic-chains/lib/src/Config/GatewayConfig';
import GatewayAddresses from '../Config/GatewayAddresses';

/**
 * It contains helper methods for facilitator init command.
 */
export default class FacilitatorInit {
/**
 * It provides gateway addresses and origin chain id. It is to be used when mosaic
 * config is provided.
 * @param auxChainId Auxiliary chain id.
 * @param mosaicConfigPath Path to mosaic config.
 * @returns originchain id and gatewayaddresses object.
 */
  public static getFromMosaicConfig(
    auxChainId: number,
    mosaicConfigPath: string,
  ): {
      originChainId?: string; gatewayAddresses?: GatewayAddresses;
    } {
    const mosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);
    const auxChain = mosaicConfig.auxiliaryChains[auxChainId];
    if (!auxChain) {
      return {};
    }

    return {
      originChainId: mosaicConfig.originChain.chain,
      gatewayAddresses: GatewayAddresses.fromMosaicConfig(mosaicConfig, auxChainId),
    };
  }

  /**
 * It provides gateway addresses and origin chain id. It is to be used when gateway
 * config is provided.
 * @param auxChainId Auxiliary chain id.
 * @param gatewayConfigPath Path to gateway config.
 * @returns originchain id and gatewayaddresses object.
 */
  public static getFromGatewayConfig(
    auxChainId: number,
    gatewayConfigPath: string,
  ): {
      originChainId?: string; gatewayAddresses?: GatewayAddresses;
    } {
    const gatewayConfig = GatewayConfig.fromFile(gatewayConfigPath);

    if (!(auxChainId === gatewayConfig.auxChainId)) {
      return {};
    }

    return {
      originChainId: gatewayConfig.mosaicConfig.originChain.chain,
      gatewayAddresses: GatewayAddresses.fromGatewayConfig(gatewayConfig),
    };
  }
}
