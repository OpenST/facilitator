import assert from 'assert';
import BigNumber from 'bignumber.js';

import Logger from '../Logger';
import Gateway from '../models/Gateway';
import GatewayRepository from '../repositories/GatewayRepository';
import ContractEntityHandler from './ContractEntityHandler';
import Utils from '../Utils';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

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
    Logger.debug('Persisting prove gateway records');
    const transaction = transactions[transactions.length - 1];
    const gatewayAddress = Utils.toChecksumAddress(transaction._gateway);
    const gateway = await this.GatewayRepository.get(gatewayAddress);

    assert(gateway !== null, `Gateway record not found for address: ${gatewayAddress}`);

    const currentLastRemoteGatewayProvenBlockHeight = new BigNumber(transaction._blockHeight);
    if (gateway && gateway.lastRemoteGatewayProvenBlockHeight
      && gateway.lastRemoteGatewayProvenBlockHeight.lt(currentLastRemoteGatewayProvenBlockHeight)) {
      Logger.debug(`Updating lastRemoteGatewayProvenBlockHeight to ${currentLastRemoteGatewayProvenBlockHeight}`);
      gateway.lastRemoteGatewayProvenBlockHeight = currentLastRemoteGatewayProvenBlockHeight;
      await this.GatewayRepository.save(gateway);
      Logger.debug(`Gateway:${gatewayAddress} lastRemoteGatewayProvenBlockHeight updated to ${
        currentLastRemoteGatewayProvenBlockHeight}`);
    }

    return [gateway!];
  }
}
