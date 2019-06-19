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

/* eslint-disable class-methods-use-this */

import {
  DataTypes, Model, InitOptions,
} from 'sequelize';

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

  public constructor(initOptions: InitOptions) {
    StakeRequestModel.init(
      {
        stakeRequestHash: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        messageHash: {
          type: DataTypes.STRING,
        },
        amount: {
          type: DataTypes.INTEGER.UNSIGNED,
        },
        beneficiary: {
          type: DataTypes.STRING,
        },
        gasPrice: {
          type: DataTypes.INTEGER.UNSIGNED,
        },
        gasLimit: {
          type: DataTypes.INTEGER.UNSIGNED,
        },
        nonce: {
          type: DataTypes.INTEGER.UNSIGNED,
        },
        gateway: {
          type: DataTypes.STRING,
        },
        stakerProxy: {
          type: DataTypes.STRING,
        },
      },
      {
        ...initOptions,
        modelName: 'stake_request',
      },
    );
  }

  public async sync(): Promise<void> {
    await StakeRequestModel.sync();
  }

  public async build(stakeRequest: StakeRequestAttributes): Promise<StakeRequestModel> {
    return StakeRequestModel.build(stakeRequest);
  }

  public async create(stakeRequest: StakeRequestAttributes): Promise<StakeRequestModel> {
    return StakeRequestModel.create(stakeRequest);
  }

  public async get(stakeRequestHash: string): Promise<StakeRequestModel | null> {
    return StakeRequestModel.findOne({
      where: {
        stakeRequestHash,
      },
    });
  }
}
