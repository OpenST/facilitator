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

import Logger from '../../Logger';
import MessageTransferRequest from '../../models/MessageTransferRequest';
import MessageTransferRequestRepository, { RequestType } from '../../repositories/MessageTransferRequestRepository';
import ContractEntityHandler from '../ContractEntityHandler';
import Utils from '../../Utils';

/**
 * This class handles stake request transactions.
 */
export default class StakeRequestedHandler extends ContractEntityHandler<MessageTransferRequest> {
  /* Storage */

  private readonly requestRepository: MessageTransferRequestRepository;

  private readonly gatewayAddress: string;

  public constructor(
    requestRepository: MessageTransferRequestRepository,
    gatewayAddress: string,
  ) {
    super();

    this.requestRepository = requestRepository;
    this.gatewayAddress = gatewayAddress;
  }

  /**
   * This method parse stake Request transaction and returns Request model object.
   *
   * Note: Forking Handling
   *
   * - Facilitator starts by subscribing to origin and auxiliary subgraphs.
   *
   * - On receiving first StakeRequested event/entity, entry is created in requests
   * repository and AcceptStakeRequest service is triggered.
   *
   * - AcceptStakeRequest sends acceptStakeRequest transaction.
   *
   * - If there is no forking of requestStake transaction, acceptStakeRequest transaction will be
   * successful.
   *
   * - If there is forking of requestStake transaction, StakeRequested event/entity is received
   * again. Facilitator checks the block number of new StakeRequested event. If block number is
   * greater than requests repository block number, then message hash is updated to blank.
   * Service sends acceptStakeRequest transaction again.
   *
   * - acceptStakeRequest transaction is successful in this case also.
   *
   * @param transactions Transaction objects.
   *
   * @return Array of instances of Request objects for stake.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async persist(transactions: any[]): Promise<MessageTransferRequest[]> {
    Logger.info(`Persisting stake request records for gateway: ${this.gatewayAddress}`);
    const models: MessageTransferRequest[] = await Promise.all(transactions
      .filter((transaction): boolean => this.gatewayAddress === Utils.toChecksumAddress(
        transaction.gateway,
      ))
      .map(
        async (transaction): Promise<MessageTransferRequest> => {
          const { stakeRequestHash } = transaction;
          const amount = new BigNumber(transaction.amount);
          const beneficiary = Utils.toChecksumAddress(transaction.beneficiary);
          const gasPrice = new BigNumber(transaction.gasPrice);
          const gasLimit = new BigNumber(transaction.gasLimit);
          const nonce = new BigNumber(transaction.nonce);
          const gateway = Utils.toChecksumAddress(transaction.gateway);
          const sender = Utils.toChecksumAddress(transaction.staker);
          const senderProxy = Utils.toChecksumAddress(transaction.stakerProxy);
          const blockNumber = new BigNumber(transaction.blockNumber);

          const stakeRequest = await this.requestRepository.get(stakeRequestHash);
          if (stakeRequest && blockNumber.gt(stakeRequest.blockNumber)) {
            Logger.debug(`stakeRequest already present for hash ${stakeRequestHash}.`);
            stakeRequest.blockNumber = blockNumber;
            // Service checks if messageHash is blank and retries acceptStakeRequest transaction.
            stakeRequest.messageHash = '';
            return stakeRequest;
          }
          return new MessageTransferRequest(
            stakeRequestHash,
            RequestType.Stake,
            blockNumber,
            amount,
            beneficiary,
            gasPrice,
            gasLimit,
            nonce,
            gateway,
            sender,
            senderProxy,
          );
        },
      ));

    const savePromises = [];
    for (let i = 0; i < models.length; i += 1) {
      Logger.debug(`Saving stake request for hash ${models[i].requestHash}`);
      savePromises.push(this.requestRepository.save(models[i]));
    }

    await Promise.all(savePromises);
    Logger.debug('Stake requests saved');
    return models;
  }
}
