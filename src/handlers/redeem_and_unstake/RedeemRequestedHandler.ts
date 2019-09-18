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
 * This class handles redeem request transactions.
 */
export default class RedeemRequestedHandler extends ContractEntityHandler<MessageTransferRequest> {
  /* Storage */

  private readonly messageTransferRequestRepository: MessageTransferRequestRepository;

  private readonly cogatewayAddress: string;

  public constructor(
    messageTransferRequestRepository: MessageTransferRequestRepository,
    cogatewayAddress: string,
  ) {
    super();

    this.messageTransferRequestRepository = messageTransferRequestRepository;
    this.cogatewayAddress = cogatewayAddress;
  }

  /**
   * This method parse redeemRequest transaction and returns MessageTransferRequest model object.
   *
   * Note: Forking Handling
   *
   * - Facilitator starts by subscribing to origin and auxiliary subgraphs.
   *
   * - On receiving first RedeemRequested event/entity, entry is created in requests
   * repository and AcceptRedeemRequest service is triggered.
   *
   * - AcceptRedeemRequest service sends acceptRedeemRequest transaction.
   *
   * - If there is no forking of requestRedeem transaction, acceptRedeemRequest transaction will be
   * successful.
   *
   * - If there is forking of requestRedeem transaction, RedeemRequested event/entity is received
   * again. Facilitator checks the block number of new RedeemRequested event. If block number is
   * greater than requests repository block number, then message hash is updated to blank.
   * acceptRedeemRequest transaction is sent again.
   *
   * - acceptRedeemRequest transaction is successful in this case.
   *
   * @param transactions Transaction objects.
   *
   * @return Array of instances of MessageTransferRequest objects.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async persist(transactions: any[]): Promise<MessageTransferRequest[]> {
    Logger.info(`Persisting redeem request records for cogateway: ${this.cogatewayAddress}`);
    const models: MessageTransferRequest[] = await Promise.all(transactions
      .filter((transaction): boolean => this.cogatewayAddress === Utils.toChecksumAddress(
        transaction.cogateway,
      ))
      .map(
        async (transaction): Promise<MessageTransferRequest> => {
          const { redeemRequestHash } = transaction;
          const amount = new BigNumber(transaction.amount);
          const beneficiary = Utils.toChecksumAddress(transaction.beneficiary);
          const gasPrice = new BigNumber(transaction.gasPrice);
          const gasLimit = new BigNumber(transaction.gasLimit);
          const nonce = new BigNumber(transaction.nonce);
          const cogateway = Utils.toChecksumAddress(transaction.cogateway);
          const sender = Utils.toChecksumAddress(transaction.redeemer);
          const senderProxy = Utils.toChecksumAddress(transaction.redeemerProxy);
          const blockNumber = new BigNumber(transaction.blockNumber);

          const redeemRequest = await this.messageTransferRequestRepository.get(redeemRequestHash);
          if (redeemRequest && blockNumber.gt(redeemRequest.blockNumber)) {
            Logger.debug(`redeemRequest already present for hash ${redeemRequestHash}.`);
            redeemRequest.blockNumber = blockNumber;
            // Service checks if messageHash is blank and retries acceptStakeRequest transaction.
            redeemRequest.messageHash = '';
            return redeemRequest;
          }
          return new MessageTransferRequest(
            redeemRequestHash,
            RequestType.Redeem,
            blockNumber,
            amount,
            beneficiary,
            gasPrice,
            gasLimit,
            nonce,
            cogateway,
            sender,
            senderProxy,
          );
        },
      ));

    const savePromises = [];
    for (let i = 0; i < models.length; i += 1) {
      Logger.debug(`Saving redeem request for hash ${models[i].requestHash}`);
      savePromises.push(
        this.messageTransferRequestRepository.save(models[i]).catch((error) => {
          Logger.error('RedeemRequestedHandler Error', error);
        })
      );
    }

    await Promise.all(savePromises);
    Logger.debug('Redeem requests saved');
    return models;
  }
}
