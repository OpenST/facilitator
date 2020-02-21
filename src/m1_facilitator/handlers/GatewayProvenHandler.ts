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

import * as Web3Utils from 'web3-utils';
import assert from 'assert';
import BigNumber from 'bignumber.js';
import Gateway from '../models/Gateway';
import GatewayRepository from '../repositories/GatewayRepository';

export default class GatewayProvenHandler {
  private readonly gatewayRepository: GatewayRepository;

  public constructor(gatewayRepository: GatewayRepository) {
    this.gatewayRepository = gatewayRepository;
  }

  public async handle(records: any[]): Promise<void> {
    const savePromises = records.map(async (record): Promise<void> => {
      assert(Web3Utils.isAddress(record.contractAddress));
      const gatewayAddress = Web3Utils.toChecksumAddress(record.contractAddress);

      const gatewayModelRecord = await this.gatewayRepository.get(gatewayAddress);
      assert(
        gatewayModelRecord !== null,
        `There is no gateway model in the gateway repository matching to ${gatewayAddress}.`,
      );
      const gatewayModel: Gateway = gatewayModelRecord as Gateway;

      const remoteGatewayLastProvenBlockNumber = new BigNumber(record.blockNumber);

      const shouldUpdate = gatewayModel.remoteGatewayLastProvenBlockNumber === undefined
        || gatewayModel.remoteGatewayLastProvenBlockNumber.isLessThan(
          remoteGatewayLastProvenBlockNumber,
        );

      if (!shouldUpdate) {
        return;
      }

      const updatedGatewayModel = new Gateway(
        gatewayModel.gatewayGA,
        gatewayModel.remoteGA,
        gatewayModel.gatewayType,
        gatewayModel.anchorGA,
        new BigNumber(record.blockNumber),
      );

      await this.gatewayRepository.save(updatedGatewayModel);
    });

    await Promise.all(savePromises);
  }
}
