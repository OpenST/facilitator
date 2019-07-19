import BigNumber from 'bignumber.js';

import Comparable from '../observer/Comparable';

/**
 * Entity types of origin and aux chain for which timestamp will be recorded.
 */
export enum EntityType {
  StakeRequesteds = 'stakeRequesteds',
  StakeIntentDeclareds = 'stakeIntentDeclareds',
  StateRootAvailables = 'stateRootAvailables',
  GatewayProvens = 'gatewayProvens',
  StakeIntentConfirmeds = 'stateIntentConfirmeds',
  StakeProgresseds = 'stakeProgresseds',
  MintProgresseds = 'mintProgresseds',
}

/**
 * Represents ContractEntity model object.
 */
export default class ContractEntity extends Comparable<ContractEntity> {
  public contractAddress: string;

  public entityType: EntityType;

  public timestamp?: BigNumber;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to set fields of Contract Entities model.
   * @param contractAddress Address of the contract.
   * @param entityType Type of the entity.
   * @param timestamp Last updated time in secs.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    contractAddress: string,
    entityType: EntityType,
    timestamp?: BigNumber,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super();
    this.contractAddress = contractAddress;
    this.entityType = entityType;
    this.timestamp = timestamp;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Compares ContractEntity objects.
   * @param other ContractEntity object which is to be compared.
   * @returns `0` if the objects are same, 1 if new object is greater and -1 if new object
   *          is lesser.
   */
  public compareTo(other: ContractEntity): number {
    const currentKey = this.contractAddress.concat(this.entityType);
    const specifiedKey = other.contractAddress.concat(other.entityType);

    if (currentKey > specifiedKey) {
      return 1;
    }

    if (currentKey < specifiedKey) {
      return -1;
    }

    return 0;
  }
}
