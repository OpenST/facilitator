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

  public readonly chainId!: number;

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
    const definedOwnProps: string[] = Utils.getDefinedOwnProps(gateway);

    await GatewayModel.upsert(
      gateway,
      {
        fields: definedOwnProps,
      },
    );

    const updatedGateway = await this.get(
      gateway.gatewayAddress,
    );
    assert(updatedGateway !== null);

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
      gatewayModel.chainId,
      gatewayModel.gatewayType,
      gatewayModel.remoteGatewayAddress,
      gatewayModel.tokenAddress,
      gatewayModel.anchorAddress,
      new BigNumber(gatewayModel.bounty),
      gatewayModel.activation,
      new BigNumber(gatewayModel.lastRemoteGatewayProvenBlockHeight),
      gatewayModel.createdAt,
      gatewayModel.updatedAt,
    );
  }
}
