import {
  DataTypes, Model, InitOptions, Op,
} from 'sequelize';
import BigNumber from 'bignumber.js';
import ContractEntity from '../models/ContractEntity';
import Subject from '../observer/Subject';
import Utils from '../Utils';

/**
 * An interface, that represents a row from a contract entities table.
 */
export class ContractEntityModel extends Model {
  public readonly contractAddress!: string;

  public readonly entityType!: string;

  public readonly timestamp!: BigNumber;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

/**
 * Entity types of origin and aux chain for which timestamp will be recorded.
 */
export enum EntityType {
  StakeRequesteds = 'stakerequesteds',
  StakeIntentDeclareds = 'stakeintentdeclareds',
  StateRootAvailables = 'staterootavailables',
  GatewayProvens = 'gatewayprovens',
  StakeIntentConfirmeds = 'stateintentconfirmeds',
  StakeProgresseds = 'stakeprogresseds',
  MintProgresseds = 'mintprogresseds',
}

/**
 * Stores instances of ContractEntity.
 *
 * Class enables creation, update and retrieval of ContractEntity objects.
 * On construction it initializes underlying database model.
 */
export class ContractEntityRepository extends Subject<ContractEntity> {
  /* Public Functions */

  public constructor(initOptions: InitOptions) {
    super();
    ContractEntityModel.init(
      {
        contractAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isAlphanumeric: true,
            len: [42, 42],
          },
          primaryKey: true,
        },
        entityType: {
          type: DataTypes.ENUM({
            values: [
              EntityType.StakeIntentDeclareds,
              EntityType.StakeRequesteds,
              EntityType.StateRootAvailables,
              EntityType.StakeIntentConfirmeds,
              EntityType.StakeProgresseds,
              EntityType.MintProgresseds,
              EntityType.GatewayProvens,
            ],
          }),
          primaryKey: true,
        },
        timestamp: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
      },
      {
        ...initOptions,
        modelName: 'ContractEntityModel',
        tableName: 'contract_entities',
      },
    );
  }

  /**
   * Saves a contract entity model in the repository.
   * If a contract entity does not exist, it creates, otherwise updates.
   *
   * Function ignores (does not set to null) undefined (optional) fields
   * from the passed stake request object.
   *
   * @param contractEntity Contract entity object to update.
   *
   * @returns Newly created or updated contract entity object.
   */
  public async save(contractEntity: ContractEntity): Promise<ContractEntity> {
    const definedOwnProps: string[] = Utils.getDefinedOwnProps(contractEntity);

    await ContractEntityModel.upsert(
      contractEntity,
      {
        fields: definedOwnProps,
      },
    );

    const updatedContractEntity = await this.get(
      contractEntity.contractAddress,
      contractEntity.entityType,
    );
    this.newUpdate(updatedContractEntity as ContractEntity);

    return updatedContractEntity as ContractEntity;
  }

  /**
   * Fetches ContractEntity data from database if found. Otherwise returns null.
   * @param contractAddress Address of the contract.
   * @param entityType Type of the entity.
   * @returns ContractEntity object containing values which satisfy the `where` condition.
   */
  public async get(
    contractAddress: string,
    entityType: string,
  ): Promise<ContractEntity | null> {
    const contractEntityModel = await ContractEntityModel.findOne({
      where: {
        contractAddress: {
          [Op.eq]: contractAddress,
        },
        entityType: {
          [Op.eq]: entityType,
        },
      },
    });

    if (contractEntityModel === null) {
      return null;
    }

    return this.convertToContractEntity(contractEntityModel);
  }


  /* Private Functions */

  /**
   * It converts contract entity model object to contract entity object.
   * @param contractEntityModel Contract entity model object to convert.
   * @returns Contract Entity object.
   */
  /* eslint-disable class-methods-use-this */
  private convertToContractEntity(contractEntityModel: ContractEntityModel): ContractEntity {
    const contractEntity = new ContractEntity(
      contractEntityModel.contractAddress,
      contractEntityModel.entityType,
      new BigNumber(contractEntityModel.timestamp),
      contractEntityModel.createdAt,
      contractEntityModel.updatedAt,
    );

    return contractEntity;
  }
}
