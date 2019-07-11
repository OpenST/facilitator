import BigNumber from 'bignumber.js';
import Comparable from '../observer/Comparable';

/**
 * Represents AuxiliaryChain model object.
 */
export default class AuxiliaryChain extends Comparable<AuxiliaryChain> {
  public chainId: number;

  public originChainName?: string;

  public ostGatewayAddress?: string;

  public ostCoGatewayAddress?: string;

  public anchorAddress?: string;

  public coAnchorAddress?: string;

  public lastProcessedBlockNumber?: BigNumber;

  public lastOriginBlockHeight?: BigNumber;

  public lastAuxiliaryBlockHeight?: BigNumber;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to set fields of AuxiliaryChain model.
   *
   * @param chainId Chain identifier.
   * @param originChainName Name of the origin chain.
   * @param ostGatewayAddress Gateway contract address.
   * @param ostCoGatewayAddress CoGateway contract address.
   * @param anchorAddress Anchor contract address.
   * @param coAnchorAddress CoAnchor contract address.
   * @param lastProcessedBlockNumber Last processed block number of that chain.
   * @param lastOriginBlockHeight Latest orign chain block height.
   * @param lastAuxiliaryBlockHeight Latest auxiliary chain block height.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    chainId: number,
    originChainName?: string,
    ostGatewayAddress?: string,
    ostCoGatewayAddress?: string,
    anchorAddress?: string,
    coAnchorAddress?: string,
    lastProcessedBlockNumber?: BigNumber,
    lastOriginBlockHeight?: BigNumber,
    lastAuxiliaryBlockHeight?: BigNumber,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.chainId = chainId;
    this.originChainName = originChainName;
    this.ostGatewayAddress = ostGatewayAddress;
    this.ostCoGatewayAddress = ostCoGatewayAddress;
    this.anchorAddress = anchorAddress;
    this.coAnchorAddress = coAnchorAddress;
    this.lastProcessedBlockNumber = lastProcessedBlockNumber;
    this.lastOriginBlockHeight = lastOriginBlockHeight;
    this.lastAuxiliaryBlockHeight = lastAuxiliaryBlockHeight;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Compares two auxiliary chain models.
   *
   * @param other An auxiliary chain object to compare with.
   *
   * @returns 0 if two objects are equal, 1 if the current object is greater
   *                 and -1 if the specified object is greater.
   */
  public compareTo(other: AuxiliaryChain): number {
    const currentKey = this.chainId;
    const specifiedKey = other.chainId;

    if (currentKey > specifiedKey) {
      return 1;
    }

    if (currentKey < specifiedKey) {
      return -1;
    }

    return 0;
  }
}
