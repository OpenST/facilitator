import BigNumber from 'bignumber.js';
import Comparable from '../observer/Comparable';

/**
 * Represents AuxiliaryChain model object.
 */
export default class AuxiliaryChain extends Comparable<AuxiliaryChain> {
  public chainId: number;

  public originChainName: string;

  public ostGatewayAddress: string;

  public ostCoGatewayAddress: string;

  public anchorAddress: string;

  public coAnchorAddress: string;

  public lastProcessedBlockNumber: BigNumber;

  public lastOriginBlockHeight: BigNumber;

  public lastAuxiliaryBlockHeight: BigNumber;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to set fields of AuxiliaryChain table.
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
    originChainName: string,
    ostGatewayAddress: string,
    ostCoGatewayAddress: string,
    anchorAddress: string,
    coAnchorAddress: string,
    lastProcessedBlockNumber: BigNumber,
    lastOriginBlockHeight: BigNumber,
    lastAuxiliaryBlockHeight: BigNumber,
    createdAt?: Date,
    updatedAt?: Date
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
   * Compares AuxiliaryChain objects.
   *
   * @param other AuxiliaryChain object which is to be compared.
   *
   * @returns `0` if the objects are same, 1 if new object is greater and -1 if new object
   *          is lesser.
   */
  public compareTo(other: AuxiliaryChain): number {
    const existingKey = this.chainId;
    const newKey = other.chainId;

    if (existingKey > newKey) {
      return 1;
    }

    if (existingKey < newKey) {
      return -1;
    }

    return 0;
  }
}
