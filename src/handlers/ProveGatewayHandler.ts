import BigNumber from 'bignumber.js';
import ContractEntityHandler from './ContractEntityHandler';
import GatewayRepository from '../repositories/GatewayRepository';
import Gateway from "../models/Gateway";
import Logger from "../Logger";

/**
 * This class handles GatewayProven transactions.
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
   * It extracts gateway model with highest block height and updates proven
   * blockHeight in Gateway model.
   *
   * @param transactions Transaction objects.
   *
   * @return Array of instances of Gateway objects.
   */
  public async persist(transactions: any[]): Promise<Gateway[]> {
    const transaction = transactions[transactions.length-1];
    const gatewayAddress = transaction._gateway as string;
    const gateway = await this.GatewayRepository.get(gatewayAddress);
    if (gateway === null) {
      throw new Error(`Cannot find record for gateway: ${gatewayAddress}`);
    }
    const lastRemoteGatewayProvenBlockHeight = new BigNumber(transaction._blockHeight);
    if(lastRemoteGatewayProvenBlockHeight.gte(gateway.lastRemoteGatewayProvenBlockHeight!)) {
      gateway.lastRemoteGatewayProvenBlockHeight = lastRemoteGatewayProvenBlockHeight;
      await this.GatewayRepository.save(gateway);
      Logger.info('Gateway:' + gatewayAddress + ' lastRemoteGatewayProvenBlockHeight updated to ' +
        lastRemoteGatewayProvenBlockHeight);
    }

    return [gateway];
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
