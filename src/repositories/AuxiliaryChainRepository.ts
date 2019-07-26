import assert from 'assert';
import BigNumber from 'bignumber.js';
import { DataTypes, InitOptions, Model } from 'sequelize';

import AuxiliaryChain from '../models/AuxiliaryChain';
import Subject from '../observer/Subject';
import Utils from '../Utils';

/**
 * An interface, that represents a row from a auxiliary_chains table.
 */
class AuxiliaryChainModel extends Model {
  public readonly chainId!: number;

  public readonly originChainName!: string;

  public readonly ostGatewayAddress!: string;

  public readonly ostCoGatewayAddress!: string;

  public readonly anchorAddress!: string;

  public readonly coAnchorAddress!: string;

  public readonly lastOriginBlockHeight!: BigNumber;

  public readonly lastAuxiliaryBlockHeight!: BigNumber;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Stores instances of AuxiliaryChain.
 *
 * Class enables creation, update and retrieval of AuxiliaryChain objects.
 * On construction it initializes underlying database model.
 */
export default class AuxiliaryChainRepository extends Subject<AuxiliaryChain> {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    super();

    AuxiliaryChainModel.init(
      {
        chainId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        originChainName: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [3, 50],
          },
        },
        ostGatewayAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        ostCoGatewayAddress: {
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
        coAnchorAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
        },
        lastOriginBlockHeight: {
          type: DataTypes.BIGINT,
          allowNull: true,
          defaultValue: null,
          validate: {
            min: 0,
          },
        },
        lastAuxiliaryBlockHeight: {
          type: DataTypes.BIGINT,
          allowNull: true,
          defaultValue: null,
          validate: {
            min: 0,
          },
        },
      },
      {
        ...initOptions,
        modelName: 'AuxiliaryChain',
        tableName: 'auxiliary_chains',
      },
    );
  }

  /**
   * Saves a AuxiliaryChain object in the repository.
   * If a AuxiliaryChain does not exist, it creates, otherwise updates.
   *
   * @param auxiliaryChain AuxiliaryChain object.
   *
   * @returns Newly created or updated AuxiliaryChain object.
   */
  public async save(auxiliaryChain: AuxiliaryChain): Promise<AuxiliaryChain> {
    const definedOwnProps: string[] = Utils.getDefinedOwnProps(auxiliaryChain);

    await AuxiliaryChainModel.upsert(
      auxiliaryChain,
      {
        fields: definedOwnProps,
      },
    );

    const updatedAuxiliaryChain = await this.get(
      auxiliaryChain.chainId,
    );
    assert(
      updatedAuxiliaryChain !== null,
      `Updated auxiliary chain record not found for chain: ${auxiliaryChain.chainId}`,
    );

    this.newUpdate(updatedAuxiliaryChain as AuxiliaryChain);

    return updatedAuxiliaryChain as AuxiliaryChain;
  }

  /**
   * Fetches AuxiliaryChain object from database if found. Otherwise returns null.
   *
   * @param chainId Chain identifier.
   *
   * @returns AuxiliaryChain object containing values which satisfy the `where` condition.
   */
  public async get(chainId: number): Promise<AuxiliaryChain | null> {
    const auxiliaryChainModel = await AuxiliaryChainModel.findOne({
      where: {
        chainId,
      },
    });

    if (auxiliaryChainModel === null) {
      return null;
    }

    return this.convertToAuxiliaryChain(auxiliaryChainModel);
  }

  /* Private Functions */

  /**
   * It converts AuxiliaryChain db object to AuxiliaryChain model object.
   *
   * @param auxiliaryChainModel AuxiliaryChainModel object to convert.
   *
   * @returns AuxiliaryChain object.
   */
  /* eslint-disable class-methods-use-this */
  private convertToAuxiliaryChain(auxiliaryChainModel: AuxiliaryChainModel): AuxiliaryChain {
    return new AuxiliaryChain(
      auxiliaryChainModel.chainId,
      auxiliaryChainModel.originChainName,
      auxiliaryChainModel.ostGatewayAddress,
      auxiliaryChainModel.ostCoGatewayAddress,
      auxiliaryChainModel.anchorAddress,
      auxiliaryChainModel.coAnchorAddress,
      new BigNumber(auxiliaryChainModel.lastOriginBlockHeight),
      new BigNumber(auxiliaryChainModel.lastAuxiliaryBlockHeight),
      auxiliaryChainModel.createdAt,
      auxiliaryChainModel.updatedAt,
    );
  }
}
