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

import ContractEntityHandler from '../../common/handlers/ContractEntityHandler';
import Logger from '../../common/Logger';

import Gateway from '../models/Gateway';
import GatewayRepository, {
  LastProvenBlockNumberIsNotStrictlyGrowingError,
} from '../repositories/GatewayRepository';


/**
 * GatewayProvenEntityInterface represents a gateway-proven subgraph entity.
 */
export interface GatewayProvenEntityInterface {
  contractAddress: string;
  remoteGateway: string;
  blockNumber: string;
}

/**
 * GatewayProven class wraps a gateway-proven subgraph entity
 * for type checks and conversions.
 */
class GatewayProven {
  public readonly gatewayAddress: string;

  public readonly remoteGatewayAddress: string;

  public readonly blockNumber: BigNumber;

  public constructor(entity: GatewayProvenEntityInterface) {
    assert(Web3Utils.isAddress(entity.contractAddress));
    assert(Web3Utils.isAddress(entity.remoteGateway));
    assert(entity.blockNumber !== '');

    this.gatewayAddress = Web3Utils.toChecksumAddress(entity.contractAddress);
    this.remoteGatewayAddress = Web3Utils.toChecksumAddress(entity.remoteGateway);
    this.blockNumber = new BigNumber(entity.blockNumber);
  }
}

/** GatewayProvenHandler class handles gateway-proven subgraph entities. */
export default class GatewayProvenHandler extends ContractEntityHandler {
  private readonly gatewayRepository: GatewayRepository;

  /** Constructs GatewayProvenHandler from the specified arguments. */
  public constructor(gatewayRepository: GatewayRepository) {
    super();

    this.gatewayRepository = gatewayRepository;
  }

  /**
   * handle() function accepts an array subgraph gateway-proven entities.
   * If there is no model in the gateway repository matching to a gateway
   * global address of an entity, the function logs a warning without failing.
   * Otherwise, it updates a model in the gateway repository matching to a
   * gateway global address of an entity with the new block number (of a gateway
   * proof). The gateway repository will throw an exception if the newly
   * proposed block number is less than or equal to the stored one.
   * The function catches the exception and logs a warning without failing.
   */
  public async handle(records: GatewayProvenEntityInterface[]): Promise<void> {
    Logger.info(`GatewayProven::records received ${records.length}`);
    const savePromises = records.map(async (entity): Promise<void> => {
      const gatewayProven = new GatewayProven(entity);

      const gatewayModel: Gateway | null = await this.gatewayRepository.get(
        gatewayProven.gatewayAddress,
      );

      if (gatewayModel === null) {
        Logger.warn(
          'There is no gateway model in the gateway repository '
          + `matching to ${gatewayProven.gatewayAddress}.`,
        );
        return;
      }

      const updatedGatewayModel = new Gateway(
        gatewayModel.gatewayGA,
        gatewayModel.remoteGA,
        gatewayModel.gatewayType,
        gatewayModel.anchorGA,
        gatewayProven.blockNumber,
      );

      try {
        await this.gatewayRepository.save(updatedGatewayModel);
        Logger.info(`GatewayProven::saved gateway having gatewayGA ${updatedGatewayModel.gatewayGA}`);
      } catch (e) {
        if (e instanceof LastProvenBlockNumberIsNotStrictlyGrowingError) {
          Logger.warn(e.message);
        } else {
          throw e;
        }
      }
    });

    await Promise.all(savePromises);
    Logger.info('GatewayProven::gateway records saved');
  }
}
