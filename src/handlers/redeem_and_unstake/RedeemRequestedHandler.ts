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
import RedeemRequest from '../../models/RedeemRequest';
import RedeemRequestRepository from '../../repositories/RedeemRequestRepository';
import ContractEntityHandler from '../ContractEntityHandler';
import Utils from '../../Utils';

/**
 * This class handles redeem request transactions.
 */
export default class RedeemRequestedHandler extends ContractEntityHandler<RedeemRequest> {
  /* Storage */

  private readonly redeemRequestRepository: RedeemRequestRepository;

  private readonly cogatewayAddress: string;

  public constructor(
    redeemRequestRepository: RedeemRequestRepository,
    cogatewayAddress: string,
  ) {
    super();

    this.redeemRequestRepository = redeemRequestRepository;
    this.cogatewayAddress = cogatewayAddress;
  }

  /**
   * This method parse redeemRequest transaction and returns redeemRequest model object.
   *
   * Note: Forking Handling
   *
   * - Facilitator starts by subscribing to origin and auxiliary subgraphs.
   *
   * - On receiving first RedeemRequested event/entity, entry is created in redeem_requests
   * repository and AcceptRedeemRequest service is triggered.
   *
   * - AcceptRedeemRequest sends acceptRedeemRequest transaction.
   *
   * - If there is no forking of requestRedeem transaction, acceptRedeemRequest transaction will be
   * successful.
   *
   * - If there is forking of requestRedeem transaction, RedeemRequested event/entity is received
   * again. Facilitator checks the block number of new RedeemRequested event. If block number is
   * greater than redeem_requests repository block number, then message hash is updated and
   * acceptRedeemRequest transaction is sent again.
   *
   * - acceptRedeemRequest transaction is successful in this case.
   *
   * @param transactions Transaction objects.
   *
   * @return Array of instances of RedeemRequest objects.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async persist(transactions: any[]): Promise<RedeemRequest[]> {
    Logger.info(`Persisting redeem request records for cogateway: ${this.cogatewayAddress}`);
    const models: RedeemRequest[] = await Promise.all(transactions
      .filter((transaction): boolean => this.cogatewayAddress === Utils.toChecksumAddress(
        transaction.cogateway,
      ))
      .map(
        async (transaction): Promise<RedeemRequest> => {
          const { redeemRequestHash } = transaction;
          const amount = new BigNumber(transaction.amount);
          const beneficiary = Utils.toChecksumAddress(transaction.beneficiary);
          const gasPrice = new BigNumber(transaction.gasPrice);
          const gasLimit = new BigNumber(transaction.gasLimit);
          const nonce = new BigNumber(transaction.nonce);
          const cogateway = Utils.toChecksumAddress(transaction.cogateway);
          const redeemer = Utils.toChecksumAddress(transaction.redeemer);
          const redeemerProxy = Utils.toChecksumAddress(transaction.redeemerProxy);
          const blockNumber = new BigNumber(transaction.blockNumber);

          const redeemRequest = await this.redeemRequestRepository.get(redeemRequestHash);
          if (redeemRequest && blockNumber.gt(redeemRequest.blockNumber)) {
            Logger.debug(`redeemRequest already present for hash ${redeemRequestHash}.`);
            redeemRequest.blockNumber = blockNumber;
            // sequelize skip updating fields whose values are undefined. Null value makes sure
            // messageHash is updated with NULL in db. null is banged because messageHash is an
            // optional model field.
            redeemRequest.messageHash = null!;
            return redeemRequest;
          }
          return new RedeemRequest(
            redeemRequestHash,
            blockNumber,
            amount,
            beneficiary,
            gasPrice,
            gasLimit,
            nonce,
            cogateway,
            redeemer,
            redeemerProxy,
          );
        },
      ));

    const savePromises = [];
    for (let i = 0; i < models.length; i += 1) {
      Logger.debug(`Saving redeem request for hash ${models[i].redeemRequestHash}`);
      savePromises.push(this.redeemRequestRepository.save(models[i]));
    }

    await Promise.all(savePromises);
    Logger.debug('Redeem requests saved');
    return models;
  }
}
