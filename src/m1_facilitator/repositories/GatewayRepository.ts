
// Copyright 2020 OpenST Ltd.
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
import Gateway, { GatewayType } from '../models/Gateway';
import Utils from '../../common/Utils';
import Subject from '../../common/observer/Subject';

/**
 * An interface, that represents a row from a gateways table.
 */
class GatewayModel extends Model {
  public gatewayGA!: string;

  public remoteGA!: string;

  public gatewayType!: GatewayType;

  public destinationGA!: string;

  public remoteGatewayLastProvenBlockNumber!: BigNumber;

  public anchorGA!: string;

  public createdAt?: Date;

  public updatedAt?: Date;
}

/**
 * Stores instances of Gateway.
 *
 * Class enables creation, update and retrieval of Gateway objects.
 * On construction, it initializes underlying database model.
 */
export default class GatewayRepository extends Subject<Gateway> {
  public constructor(initOptions: InitOptions) {
    super();

    GatewayModel.init(
      {
        gatewayGA: {
          type: DataTypes.STRING,
          primaryKey: true,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        remoteGA: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        gatewayType: {
          type: DataTypes.ENUM({
            values: [
              GatewayType.CONSENSUS,
              GatewayType.MOST,
              GatewayType.ERC20,
              GatewayType.NFT,
            ],
          }),
        },
        anchorGA: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        destinationGA: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        remoteGatewayLastProvenBlockNumber: {
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
   * If a Gateway model does not exist, it creates else it updates.
   *
   * @param gateway Gateway object to update.
   *
   * @returns Newly created or updated Gateway object.
   */
  public async save(gateway: Gateway): Promise<Gateway> {
    const gatewayModelObj = await GatewayModel.findOne(
      {
        where: {
          gatewayGA: gateway.gatewayGA,
        },
      },
    );

    let updatedGateway: Gateway | null;
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
            gatewayGA: gateway.gatewayGA,
          },
          fields: definedOwnProps,
        },
      );
      updatedGateway = await this.get(
        gateway.gatewayGA,
      );
    }

    assert(
      updatedGateway !== null,
      `Updated Gateway record not found for gateway global address: ${gateway.gatewayGA}`,
    );

    this.newUpdate(updatedGateway as Gateway);

    return updatedGateway as Gateway;
  }

  /**
   * It retrieves record from Gateway model for an gateway global address.
   *
   * @param gatewayGA Gateway global address whose record is to be retrieved.
   *
   * @returns Gateway object if record present for gateway global address otherwise `null`.
   */
  public async get(gatewayGA: string): Promise<Gateway | null> {
    const gatewayModel = await GatewayModel.findOne({
      where: {
        gatewayGA,
      },
    });

    if (gatewayModel === null) {
      return null;
    }

    return this.convertToGateway(gatewayModel);
  }

  /**
   * It retrieves record from Gateway model for an anchor global address.
   *
`   * @param anchorGA Anchor global address.
 `  *
   * @returns Gateway object if record present for anchor global address otherwise `null`.
   */
  public async getByAnchor(anchorGA: string): Promise<Gateway | null> {
    const gatewayModel = await GatewayModel.findOne({
      where: {
        anchorGA,
      },
    });

    if (gatewayModel === null) {
      return null;
    }

    return this.convertToGateway(gatewayModel);
  }

  /* Private Functions */

  /**
   * It converts Gateway db object to Gateway model object.
   *
   * @param gatewayModel GatewayModel object to convert.
   *
   * @returns Gateway object.
   */
  /* eslint-disable class-methods-use-this */
  private convertToGateway(gatewayModel: GatewayModel): Gateway {
    return new Gateway(
      gatewayModel.gatewayGA,
      gatewayModel.remoteGA,
      gatewayModel.gatewayType,
      gatewayModel.anchorGA,
      gatewayModel.remoteGatewayLastProvenBlockNumber,
      gatewayModel.destinationGA,
      gatewayModel.createdAt,
      gatewayModel.updatedAt,
    );
  }
}
