import BigNumber from 'bignumber.js';
import ContractEntityHandler from './ContractEntityHandler';
import GatewayRepository from '../repositories/GatewayRepository';
import StakeRequest from '../models/StakeRequest';

/**
 * This class handels prove gateway handler transactions.
 */
export default class ProveGatewayHandler extends ContractEntityHandler<StakeRequest> {
  /* Storage */

  private readonly GatewayRepository: GatewayRepository;

  public constructor(GatewayRepository: GatewayRepository) {
    super();

    this.GatewayRepository = GatewayRepository;
  }

  /**
   * This method parses gatewayProven transactions and returns gatewayRepository model object.
   *
   * @param transactions Transaction objects.
   *
   * @return Array of instances of GatewayRepository objects.
   */
  public async persist(transactions: any[]): Promise<StakeRequest[]> {

    // Integration with GatewayRepository here

    const savePromises = [];
    for (let i = 0; i < models.length; i += 1) {
      savePromises.push(this.GatewayRepository.save(models[i]));
    }
    await Promise.all(savePromises);

    return models;
  }
}
