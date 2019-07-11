import BigNumber from 'bignumber.js';
import ContractEntityHandler from './ContractEntityHandler';
import GatewayRepository from '../repositories/GatewayRepository';
import Gateway from "../models/Gateway";
import Logger from "../Logger";

/**
 * This class handels prove gateway handler transactions.
 */
export default class ProveGatewayHandler extends ContractEntityHandler<Gateway> {
  /* Storage */

  private readonly GatewayRepository: GatewayRepository;

  public constructor(GatewayRepository: GatewayRepository) {
    super();

    this.GatewayRepository = GatewayRepository;
  }

  /**
   * This method parses gatewayProven transactions and returns Gateway object.
   * It updates lastRemoteGatewayProvenBlockHeight for a Gateway model.
   *
   * @param transactions Transaction objects.
   *
   * @return Array of instances of Gateway objects.
   */
  public async persist(transactions: any[]): Promise<Gateway[]> {
    let models: Gateway[] = [];
    for (let i = 0; i < transactions.length; i += 1) {
      const transaction = transactions[i];
      const gatewayAddress = transaction._gateway as string;
      const gateway = await this.GatewayRepository.get(gatewayAddress);
      if (gateway === null) {
        throw new Error(`Cannot find record for gateway ${gatewayAddress}`);
      }
      const lastRemoteGatewayProvenBlockHeight = new BigNumber(transaction._blockHeight);
      gateway.lastRemoteGatewayProvenBlockHeight = lastRemoteGatewayProvenBlockHeight;
      models.push(gateway);
    }
    await Promise.all(models);

    return models;
  }

  /**
   * This method defines action on receiving gateway models.
   *
   * @param gateway array of instances of gateway object.
   */
  public handle = async (gateway: Gateway[]): Promise<void> => {
    Logger.info(`Gateway  : ${gateway}`);
    return Promise.resolve();
  };
}
