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
  DataTypes, Model, InitOptions, Op,
} from 'sequelize';
import BigNumber from 'bignumber.js';
// import Subject from '../observer/Subject';

import assert = require('assert');

export class GatewayModel extends Model {}

/**
 * To be used for calling any methods which would change states of record(s) in Database.
 */
export interface GatewayAttributes {
  gatewayAddress: string;
  chainId: number;
  gatewayType: string;
  remoteGatewayAddress: string;
  tokenAddress: string;
  anchorAddress: string;
  bounty: BigNumber;
  activation: boolean;
  lastRemoteGatewayProvenBlockHeight?: BigNumber;
}

/**
 * Repository would always return database rows after typecasting to this.
 */
export interface Gateway extends GatewayAttributes{
  createdAt: Date;
  updatedAt: Date;
}

export enum GatewayType {
  Origin = 'origin',
  Auxiliary = 'auxiliary',
}

export class GatewayRepository { // extends Subject<Gateway> {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    // super();

    GatewayModel.init(
      {
        gatewayAddress: {
          type: DataTypes.STRING,
          primaryKey: true,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        chainId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        gatewayType: {
          type: DataTypes.ENUM({
            values: [GatewayType.Origin, GatewayType.Auxiliary],
          }),
          allowNull: false,
        },
        remoteGatewayAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        tokenAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        anchorAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        bounty: {
          type: DataTypes.BIGINT,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        activation: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        lastRemoteGatewayProvenBlockHeight: {
          type: DataTypes.BIGINT,
          allowNull: true,
          validate: {
            min: 0,
          },
        },
      },
      {
        ...initOptions,
        modelName: 'gateway',
        tableName: 'gateway',
      },
    );
  }

  /**
   * Creates a gateway model in the repository and syncs with database.
   * @param {GatewayAttributes} gatewayAttributes
   * @return {Promise<Gateway>}
   */
  public async create(gatewayAttributes: GatewayAttributes): Promise<Gateway> {
    try {
      const gateway: Gateway = await GatewayModel.create(gatewayAttributes) as Gateway;
      this.format(gateway);
      // this.newUpdate(gateway);
      return gateway;
    } catch (e) {
      const errorContext = {
        attributes: gatewayAttributes,
        reason: e.message,
      };
      return Promise.reject(`Failed to create a gateway: ${JSON.stringify(errorContext)}`);
    }
  }

  /**
   * Fetches gateway data from database.
   * @param {string} gatewayAddress
   * @return {Promise<Gateway | null>}
   */
  public async get(gatewayAddress: string): Promise<Gateway | null> {
    const gatewayModel = await GatewayModel.findOne({
      where: {
        gatewayAddress,
      },
    });

    if (gatewayModel === null) {
      return null;
    }
    const gateway: Gateway = gatewayModel;
    this.format(gateway);
    return gateway;
  }


  /** Updates gateway data in database and does not return the updated state. */
  public async update(gatewayAttributes: GatewayAttributes): Promise<boolean> {
    const [updatedRowCount] = await GatewayModel.update({
      gatewayAddress: gatewayAttributes.gatewayAddress,
      chainId: gatewayAttributes.chainId,
      gatewayType: gatewayAttributes.gatewayType,
      remoteGatewayAddress: gatewayAttributes.remoteGatewayAddress,
      tokenAddress: gatewayAttributes.tokenAddress,
      anchorAddress: gatewayAttributes.anchorAddress,
      bounty: gatewayAttributes.bounty,
      activation: gatewayAttributes.activation,
      lastRemoteGatewayProvenBlockHeight: gatewayAttributes.lastRemoteGatewayProvenBlockHeight,
    }, {
      where: {
        gatewayAddress: {
          [Op.eq]: gatewayAttributes.gatewayAddress,
        },
      },
    });

    assert(
      updatedRowCount <= 1,
      'As a gateway address is a primary key, one or no entry should be affected.',
    );

    if (updatedRowCount === 1) {
      const gateway = await this.get(gatewayAttributes.gatewayAddress);
      assert(gateway !== null);
      // this.newUpdate(gateway as Gateway);

      return true;
    }

    return false;
  }

  /**
   * Modifies the message object by typecasting required properties.
   * @param {Gateway} gateway
   */
  private format(gateway: Gateway): void {
    gateway.bounty = new BigNumber(gateway.bounty);
    if (gateway.lastRemoteGatewayProvenBlockHeight) {
      gateway.lastRemoteGatewayProvenBlockHeight = new BigNumber(gateway.lastRemoteGatewayProvenBlockHeight);
    }
  }
}
