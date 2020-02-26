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


import BigNumber from 'bignumber.js';

import Comparable from '../observer/Comparable';

/**
 * Entity types of origin and aux chain for which timestamp will be recorded.
 * These entity type are supported in Mosaic-0 and Mosaic-1.
 */
export enum EntityType {
  // Common entities
  StateRootAvailables = 'stateRootAvailables',
  GatewayProvens = 'gatewayProvens',
  // M0 entities
  // Stake & Mint entities
  StakeRequesteds = 'stakeRequesteds',
  StakeIntentDeclareds = 'stakeIntentDeclareds',
  StakeIntentConfirmeds = 'stakeIntentConfirmeds',
  StakeProgresseds = 'stakeProgresseds',
  MintProgresseds = 'mintProgresseds',
  // Redeem & Unstake entities
  RedeemRequesteds = 'redeemRequesteds',
  RedeemIntentDeclareds = 'redeemIntentDeclareds',
  RedeemIntentConfirmeds = 'redeemIntentConfirmeds',
  RedeemProgresseds = 'redeemProgresseds',
  UnstakeProgresseds = 'unstakeProgresseds',
  // M1 entities
  DeclaredDepositIntents = 'declaredDepositIntents',
  ConfirmedWithdrawIntents = 'confirmedWithdrawIntents',
  DeclaredWithdrawIntents = 'declaredWithdrawIntents',
  ConfirmedDepositIntents = 'confirmedDepositIntents',
  CreatedUtilityTokens = 'createdUtilityTokens',
}

/**
 * Represents ContractEntity model object.
 */
export default class ContractEntity extends Comparable<ContractEntity> {
  public contractAddress: string;

  public entityType: EntityType;

  public timestamp: BigNumber;

  public createdAt?: Date;

  public updatedAt?: Date;

  /**
   * Constructor to set fields of Contract Entities model.
   * @param contractAddress Address of the contract.
   * @param entityType Type of entity.
   * @param timestamp Last updated time in secs.
   * @param createdAt Time at which record is created.
   * @param updatedAt Time at which record is updated.
   */
  public constructor(
    contractAddress: string,
    entityType: EntityType,
    timestamp: BigNumber,
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
    const currentKey = this.contractAddress.concat(this.entityType as string);
    const specifiedKey = other.contractAddress.concat(this.entityType as string);

    if (currentKey > specifiedKey) {
      return 1;
    }

    if (currentKey < specifiedKey) {
      return -1;
    }

    return 0;
  }
}
