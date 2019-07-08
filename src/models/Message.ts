import BigNumber from 'bignumber.js';
import Comparable from '../observer/Comparable';

/**
 * Represents Gateway model object.
 */
export default class Message extends Comparable<Message> {
  public messageHash: string;

  public type: string;

  public gatewayAddress: string;

  public sourceStatus: string;

  public targetStatus: string;

  public gasPrice: BigNumber;

  public gasLimit: BigNumber;

  public nonce: BigNumber;

  public sender: string;

  public direction: string;

  public sourceDeclarationBlockHeight: BigNumber;

  public secret: string;

  public hashLock: string;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to set fields of Messages table.
   *
   * @param messageHash Message hash is unique for each request.
   * @param type Type of the message stake/redeem.
   * @param gatewayAddress Gateway contract address.
   * @param sourceStatus Status of source.
   * @param targetStatus Status of target.
   * @param gasPrice Gas price that staker is ready to pay to get the stake and mint process done.
   * @param gasLimit Gas limit that staker is ready to pay.
   * @param nonce Nonce of the staker address.
   * @param sender Staker address.
   * @param direction o2a or a2o direction.
   * @param sourceDeclarationBlockHeight Source block height at which message wa declared.
   * @param secret Unlock secret for the hashLock provide by the staker while initiating the stake.
   * @param hashLock Hash Lock provided by the facilitator.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    messageHash: string,
    type: string,
    gatewayAddress: string,
    sourceStatus: string,
    targetStatus: string,
    gasPrice: BigNumber,
    gasLimit: BigNumber,
    nonce: BigNumber,
    sender: string,
    direction: string,
    sourceDeclarationBlockHeight: BigNumber,
    secret: string,
    hashLock: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.messageHash = messageHash;
    this.type = type;
    this.gatewayAddress = gatewayAddress;
    this.sourceStatus = sourceStatus;
    this.targetStatus = targetStatus;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.nonce = nonce;
    this.sender = sender;
    this.direction = direction;
    this.sourceDeclarationBlockHeight = sourceDeclarationBlockHeight;
    this.secret = secret;
    this.hashLock = hashLock;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Compares Message objects.
   *
   * @param other Message object which is to be compared.
   *
   * @returns `0` if the objects are same, 1 if new object is greater and -1 if new object
   *          is lesser.
   */
  public compareTo(other: Message): number {
    const existingKey = this.messageHash;
    const newKey = other.messageHash;

    if (existingKey > newKey) {
      return 1;
    }

    if (existingKey < newKey) {
      return -1;
    }

    return 0;
  }
}
