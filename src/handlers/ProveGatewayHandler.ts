import BigNumber from 'bignumber.js';
import ContractEntityHandler from './ContractEntityHandler';
import GatewayRepository from '../repositories/GatewayRepository';
import Gateway from '../models/Gateway';
import Logger from '../Logger';

/**
 * This class handles GatewayProven transactions and updates lastRemoteGatewayProvenBlockHeight
 * in Gateway model.
 */
export default class ProveGatewayHandler extends ContractEntityHandler<Gateway> {
  private readonly GatewayRepository: GatewayRepository;

  public constructor(gatewayRepository: GatewayRepository) {
    super();

    this.GatewayRepository = gatewayRepository;
  }

  /**
   * This method parses gatewayProven transactions and returns Gateway object.
   * It extracts gateway model with highest block height and updates proven
   * blockHeight in Gateway model.
   *
   * @param transactions Transaction objects.
   *
   * @return List of instances of Gateway objects.
   */
  public async persist(transactions: any[]): Promise<Gateway[]> {
    const transaction = transactions[transactions.length - 1];
    const gatewayAddress = transaction._gateway as string;
    const gateway = await this.GatewayRepository.get(gatewayAddress);
    if (gateway === null) {
      throw new Error(`Cannot find record for gateway: ${gatewayAddress}`);
    }
    const currentLastRemoteGatewayProvenBlockHeight = new BigNumber(transaction._blockHeight);
    if (gateway.lastRemoteGatewayProvenBlockHeight
      && gateway.lastRemoteGatewayProvenBlockHeight.lt(currentLastRemoteGatewayProvenBlockHeight)) {
      gateway.lastRemoteGatewayProvenBlockHeight = currentLastRemoteGatewayProvenBlockHeight;
      await this.GatewayRepository.save(gateway);
      Logger.info(`Gateway:${gatewayAddress} lastRemoteGatewayProvenBlockHeight updated to ${
        currentLastRemoteGatewayProvenBlockHeight}`);
    }

    return [gateway];
  }
}
