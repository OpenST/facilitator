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

import { DataTypes, Model, Sequelize } from 'sequelize';

/* eslint-disable class-methods-use-this */

export interface StakeRequestAttributes {
  stakeRequestHash: string;
  messageHash: string;
  amount: number;
  beneficiary: string;
  gasPrice: number;
  gasLimit: number;
  nonce: number;
  gateway: string;
  stakerProxy: string;
}

export class StakeRequestModel extends Model {
  public stakeRequestHash!: string;

  public messageHash!: string;

  public amount!: number;

  public beneficiary!: string;

  public gasPrice!: number;

  public gasLimit!: number;

  public nonce!: number;

  public gateway!: string;

  public stakerProxy!: string;

  public createdAt!: Date;

  public updatedAt!: Date;
}

export default class StakeRequestRepository {
  /* Public Functions */

  public constructor(sequelize: Sequelize) {
    StakeRequestModel.init(
      {
        stakeRequestHash: {
          type: DataTypes.STRING,
          field: 'stake_request_hash',
        },
        messageHash: {
          type: DataTypes.STRING,
          field: 'message_hash',
        },
        amount: {
          type: DataTypes.INTEGER,
          field: 'amount',
        },
        beneficiary: {
          type: DataTypes.STRING,
          field: 'beneficiary',
        },
        gasPrice: {
          type: DataTypes.INTEGER,
          field: 'gas_price',
        },
        gasLimit: {
          type: DataTypes.INTEGER,
          field: 'gas_limit',
        },
        nonce: {
          type: DataTypes.INTEGER,
          field: 'nonce',
        },
        gateway: {
          type: DataTypes.STRING,
          field: 'gateway',
        },
        stakerProxy: {
          type: DataTypes.STRING,
          field: 'staker_proxy',
        },
      },
      {
        sequelize,
        modelName: 'stake_request',
      },
    );

    StakeRequestModel.sync();
  }

  public async create(stakeRequest: StakeRequestAttributes): Promise<StakeRequestModel> {
    return StakeRequestModel.create(stakeRequest);
  }

  public async get(stakeRequestHash: string): Promise<StakeRequestModel | null> {
    const stakeRequestInstance = StakeRequestModel.findOne({
      where: {
        stakeRequestHash,
      },
    });

    return stakeRequestInstance;
  }
}
