// Copyright 2020 OpenST Ltd.
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

import { Mutex } from 'async-mutex';
import * as Web3Utils from 'web3-utils';
import assert from 'assert';
import BigNumber from 'bignumber.js';
import Gateway from '../models/Gateway';
import GatewayRepository from '../repositories/GatewayRepository';
import Logger from '../../common/Logger';

/**
 * GatewayProven struct represents a GatewayProven subgraph entity
 * for better type checking, readability of code.
 */
class GatewayProvenEntity {
  public readonly gatewayAddress: string;

  public readonly remoteGatewayAddress: string;

  public readonly blockNumber: BigNumber;

  public constructor(
    gatewayAddress: string,
    remoteGatewayAddress: string,
    blockNumber: string,
  ) {
    assert(Web3Utils.isAddress(gatewayAddress));
    assert(Web3Utils.isAddress(remoteGatewayAddress));

    this.gatewayAddress = Web3Utils.toChecksumAddress(gatewayAddress);
    this.remoteGatewayAddress = Web3Utils.toChecksumAddress(remoteGatewayAddress);
    this.blockNumber = new BigNumber(blockNumber);
  }
}

/**
 * GatewayProvenHandler class handles gateway-proven subgraph entities.
 */
export default class GatewayProvenHandler {
  private readonly gatewayRepository: GatewayRepository;

  private mutex: Mutex;

  /** Constructs GatewayProvenHandler from the specified arguments. */
  public constructor(gatewayRepository: GatewayRepository) {
    this.gatewayRepository = gatewayRepository;
    this.mutex = new Mutex();
  }

  /**
   * handler() function accepts an array of records of a proven-gateway
   * subgraph type.
   *
   * @pre There should exist a record in the `gatewayRepository` for each record
   *      matching to `record.contractAddress` (in this case gateway address).
   *
   * @post Function updates a record of `gatewayRepository` matching to
   *       `record.contractAddress` (gateway address) by setting
   *       `remoteGatewayLastProvenBlockNumber` to the `record.blockNumber`
   *       if `record.blockNumber` is greater than
   *       `remoteGatewayLastProvenBlockNumber` of the stored value in the
   *       repository.
   */
  public async handle(records: any[]): Promise<void> {
    const savePromises = records.map(async (record): Promise<void> => {
      const gatewayProvenEntity = new GatewayProvenEntity(
        record.contractAddress,
        record.remoteGateway,
        record.blockNumber,
      );

      const gatewayModelRecord: Gateway | null = await this.gatewayRepository.get(
        gatewayProvenEntity.gatewayAddress,
      );

      if (gatewayModelRecord === null) {
        Logger.warning(
          'There is no gateway model in the gateway repository '
          + `matching to ${gatewayProvenEntity.gatewayAddress}.`,
        );
        return;
      }

      // We can safely cast as a check above is excluding the null case.
      const gatewayModel: Gateway = gatewayModelRecord;

      // As potentially multiple GatewayProven events for the same Gateway
      // can appear in handler, we lock 'check should we upsert and upsert itself'
      // part.
      const release = await this.mutex.acquire();
      try {
        const shouldUpdate = gatewayModel.remoteGatewayLastProvenBlockNumber === undefined
        || gatewayModel.remoteGatewayLastProvenBlockNumber.isLessThan(
          gatewayProvenEntity.blockNumber,
        );

        if (!shouldUpdate) {
          return;
        }

        const updatedGatewayModel = new Gateway(
          gatewayModel.gatewayGA,
          gatewayModel.remoteGA,
          gatewayModel.gatewayType,
          gatewayModel.anchorGA,
          gatewayProvenEntity.blockNumber,
        );

        await this.gatewayRepository.save(updatedGatewayModel);
      } finally {
        release();
      }
    });

    await Promise.all(savePromises);
  }
}
