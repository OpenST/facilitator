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

import BigNumber from 'bignumber.js';

import Logger from '../Logger';
import StakeRequest from '../models/StakeRequest';
import StakeRequestRepository from '../repositories/StakeRequestRepository';
import ContractEntityHandler from './ContractEntityHandler';
import Utils from '../Utils';
import GatewayRepository from "../repositories/GatewayRepository";
import Gateway from "../models/Gateway";

/**
 * This class handles stake request transactions.
 */
export default class StakeRequestHandler extends ContractEntityHandler<StakeRequest> {
  /* Storage */

  private readonly stakeRequestRepository: StakeRequestRepository;
  private readonly gatewayRepository: GatewayRepository;

  public constructor(
    stakeRequestRepository: StakeRequestRepository,
    gatewayRepository: GatewayRepository
  ) {
    super();

    this.stakeRequestRepository = stakeRequestRepository;
    this.gatewayRepository = gatewayRepository;
  }

  /**
   * This method parse stakeRequest transaction and returns stakeRequest model object.
   *
   * @param transactions Transaction objects.
   *
   * @return Array of instances of StakeRequest objects.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async persist(transactions: any[]): Promise<StakeRequest[]> {
    Logger.debug('Persisting stake request records');
    const models: StakeRequest[] = transactions.map(
      (transaction): StakeRequest => {
        const { stakeRequestHash } = transaction;
        const amount = new BigNumber(transaction.amount);
        const beneficiary = Utils.toChecksumAddress(transaction.beneficiary);
        const gasPrice = new BigNumber(transaction.gasPrice);
        const gasLimit = new BigNumber(transaction.gasLimit);
        const nonce = new BigNumber(transaction.nonce);
        const gateway = Utils.toChecksumAddress(transaction.gateway);
        const staker = Utils.toChecksumAddress(transaction.staker);
        const stakerProxy = Utils.toChecksumAddress(transaction.stakerProxy);

        return new StakeRequest(
          stakeRequestHash,
          amount,
          beneficiary,
          gasPrice,
          gasLimit,
          nonce,
          gateway,
          staker,
          stakerProxy,
        );
      },
    );

    const originGateways: Gateway[] = await this.gatewayRepository.getAllByChain('goerli');
    const originGatewayAddress = originGateways[0].gatewayAddress;
    const savePromises = [];
    for (let i = 0; i < models.length; i += 1) {
      if (originGatewayAddress === models[i].gateway) {
        Logger.debug(`Saving stake request for hash ${models[i].stakeRequestHash}`);
        savePromises.push(this.stakeRequestRepository.save(models[i]));
      } else {
        Logger.debug(`Gateway address should be ${originGatewayAddress} but found to be: ${models[i].gateway}`);
      }
    }

    await Promise.all(savePromises);
    Logger.debug('Stake requests saved');
    return models;
  }
}
