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


import assert from 'assert';
import BigNumber from 'bignumber.js';
import { DataTypes, InitOptions, Model } from 'sequelize';

import Gateway from '../models/Gateway';
import Subject from '../observer/Subject';
import Utils from '../Utils';

/**
 * An interface, that represents a row from a gateways table.
 */
class GatewayModel extends Model {
  public readonly gatewayAddress!: string;

  public readonly chain!: string;

  public readonly gatewayType!: string;

  public readonly remoteGatewayAddress!: string;

  public readonly tokenAddress!: string;

  public readonly anchorAddress!: string;

  public readonly bounty!: BigNumber;

  public readonly activation!: boolean;

  public readonly lastRemoteGatewayProvenBlockHeight!: BigNumber;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Gateway types of origin and auxiliary chain.
 */
export enum GatewayType {
  Origin = 'origin',
  Auxiliary = 'auxiliary',
}

/**
 * Stores instances of Gateway.
 *
 * Class enables creation, updation and retrieval of Gateway objects.
 * On construction it initializes underlying database model.
 */
export default class GatewayRepository extends Subject<Gateway> {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    super();

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
        chain: {
          type: DataTypes.STRING,
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
          type: DataTypes.DECIMAL(32),
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        activation: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          validate: {
            min: 0,
          },
        },
        lastRemoteGatewayProvenBlockHeight: {
          type: DataTypes.BIGINT,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
      },
      {
        ...initOptions,
        modelName: 'Gateway',
        tableName: 'gateways',
      },
    );
  }

  /**
   * Saves a Gateway model in the repository.
   * If a gateway does not exist, it creates, otherwise updates.
   *
   * @param gateway Gateway object to update.
   *
   * @returns Newly created or updated gateway object.
   */
  public async save(gateway: Gateway): Promise<Gateway> {
    const gatewayModelObj = await GatewayModel.findOne(
      {
        where: {
          gatewayAddress: gateway.gatewayAddress,
        },
      },
    );

    let updatedGateway: Gateway|null;
    if (gatewayModelObj === null) {
      updatedGateway = this.convertToGateway(await GatewayModel.create(
        gateway,
      ));
    } else {
      const definedOwnProps: string[] = Utils.getDefinedOwnProps(gateway);
      await GatewayModel.update(
        gateway,
        {
          where: {
            gatewayAddress: gateway.gatewayAddress,
          },
          fields: definedOwnProps,
        },
      );
      updatedGateway = await this.get(
        gateway.gatewayAddress,
      );
    }

    assert(
      updatedGateway !== null,
      `Updated Gateway record not found for gateway address: ${gateway.gatewayAddress}`,
    );

    this.newUpdate(updatedGateway as Gateway);

    return updatedGateway as Gateway;
  }

  /**
   * Fetches Gateway data from database if found. Otherwise returns null.
   *
   * @param gatewayAddress Address of the gateway contract.
   * @returns Gateway object containing values which satisfy the `where` condition.
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

    return this.convertToGateway(gatewayModel);
  }

  /**
   * This method returns gateway record based on chain identifier and gateway address.
   *
   * @param chain Chain identifier.
   * @param gatewayAddress Gateway address.
   * @returns Gateway object containing values which satisfy the `where` condition.
   */
  public async getByChainGateway(chain: string, gatewayAddress: string): Promise<Gateway | null> {
    const gatewayRecord = await GatewayModel.findOne({
      where: {
        chain,
        gatewayAddress,
      },
    });

    if (gatewayRecord === null) {
      return null;
    }

    return this.convertToGateway(gatewayRecord);
  }

  /**
   * This method returns list of gateway records based on chain identifier.
   * @param chain Chain identifier.
   */
  public async getAllByChain(chain: string): Promise<Gateway []> {
    const models = await GatewayModel.findAll({
      where: {
        chain,
      },
    });

    return models.map((model: GatewayModel) => {
      const gateway: Gateway = this.convertToGateway(model);
      return gateway;
    });
  }


  /* Private Functions */

  /**
   * It converts Gateway db object to Gateway model object.
   *
   * @param gatewayModel GatewayModel object to convert.
   * @returns Gateway object.
   */
  /* eslint-disable class-methods-use-this */
  private convertToGateway(gatewayModel: GatewayModel): Gateway {
    return new Gateway(
      gatewayModel.gatewayAddress,
      gatewayModel.chain,
      gatewayModel.gatewayType,
      gatewayModel.remoteGatewayAddress,
      gatewayModel.tokenAddress,
      gatewayModel.anchorAddress,
      new BigNumber(gatewayModel.bounty),
      new BigNumber(gatewayModel.lastRemoteGatewayProvenBlockHeight),
      gatewayModel.activation,
      gatewayModel.createdAt,
      gatewayModel.updatedAt,
    );
  }
}
