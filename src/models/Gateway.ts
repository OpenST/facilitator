import BigNumber from 'bignumber.js';
import Comparable from '../observer/Comparable';

/**
 * Represents Gateway model object.
 */
export default class Gateway extends Comparable<Gateway> {
  public gatewayAddress: string;

  public chain?: string;

  public gatewayType?: string;

  public remoteGatewayAddress?: string;

  public tokenAddress?: string;

  public anchorAddress?: string;

  public bounty?: BigNumber;

  public activation?: boolean;

  public lastRemoteGatewayProvenBlockHeight?: BigNumber;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to set fields of Gateway model.
   *
   * @param gatewayAddress Address of the gateway contract.
   * @param chain Chain identifier.
   * @param gatewayType Type of gateway origin/auxiliary.
   * @param remoteGatewayAddress Gateway contract address of remote chain.
   * @param tokenAddress The ERC20 token contract address that will be staked and corresponding
   *                     utility tokens will be minted in auxiliary chain.
   * @param anchorAddress Anchor contract address.
   * @param bounty The amount that facilitator will stakes to initiate the
   *               stake process..
   * @param activation Gateway is activated or not.
   * @param lastRemoteGatewayProvenBlockHeight Last block height at which block height was proven.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    gatewayAddress: string,
    chain?: string,
    gatewayType?: string,
    remoteGatewayAddress?: string,
    tokenAddress?: string,
    anchorAddress?: string,
    bounty?: BigNumber,
    activation?: boolean,
    lastRemoteGatewayProvenBlockHeight?: BigNumber,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.gatewayAddress = gatewayAddress;
    this.chain = chain;
    this.gatewayType = gatewayType;
    this.remoteGatewayAddress = remoteGatewayAddress;
    this.tokenAddress = tokenAddress;
    this.anchorAddress = anchorAddress;
    this.bounty = bounty;
    this.activation = activation;
    this.lastRemoteGatewayProvenBlockHeight = lastRemoteGatewayProvenBlockHeight;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Compares two Gateway models.
   *
   * @param other A Gateway object to compare with.
   *
   * @returns 0 if two objects are equal, 1 if the current object is greater
   *                 and -1 if the specified object is greater.
   */
  public compareTo(other: Gateway): number {
    const currentKey = this.gatewayAddress;
    const specifiedKey = other.gatewayAddress;

    if (currentKey > specifiedKey) {
      return 1;
    }

    if (currentKey < specifiedKey) {
      return -1;
    }

    return 0;
  }
}
