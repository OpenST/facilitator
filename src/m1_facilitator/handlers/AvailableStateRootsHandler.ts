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

import BigNumber from 'bignumber.js';

import ContractEntityHandler from '../../common/handlers/ContractEntityHandler';
import Utils from '../../common/Utils';

import AnchorRepository from '../repositories/AnchorRepository';
import Anchor from '../models/Anchor';
import Logger from '../../common/Logger';


/** Represents record of AvailableStateRootsEntity. */
interface AvailableStateRootsEntityInterface {
  contractAddress: string;
  blockNumber: string;
}

/**
 * This class handles the updates from AvailableStateRoots entity.
 */
export default class AvailableStateRootsHandler extends ContractEntityHandler {
  /* Instance of anchor repository. */
  private anchorRepository: AnchorRepository;

  /**
   * Construct AvailableStateRootsHandler with the params.
   *
   * @param anchorRepository Instance of Anchor repository.
   */
  public constructor(anchorRepository: AnchorRepository) {
    super();

    this.anchorRepository = anchorRepository;
  }

  /**
   * Handles the AvailableStateRoots entity records.
   * - Updates the latest anchored block number.
   * - This handler only reacts to the events of anchors which are populated
   *   during seed data. It silently ignores events by other anchors.
   *
   * @param records List of AvailableStateRoots.
   */
  public async handle(records: AvailableStateRootsEntityInterface[]): Promise<void> {
    const contractAddressVsBlockNumberMap = new Map();
    Logger.info(`AvailableStateRootHandler::records received: ${records.length}`);
    records.forEach((record): void => {
      const contractAddress = Utils.toChecksumAddress(record.contractAddress);
      const blockNumber = new BigNumber(record.blockNumber);
      if (!contractAddressVsBlockNumberMap.has(record.contractAddress)) {
        contractAddressVsBlockNumberMap.set(contractAddress, blockNumber);
      }
      if (contractAddressVsBlockNumberMap.get(contractAddress).isLessThan(blockNumber)) {
        contractAddressVsBlockNumberMap.set(contractAddress, blockNumber);
      }
    });

    const savePromises = Array.from(contractAddressVsBlockNumberMap.keys())
      .map(async (contractAddress): Promise<void> => {
        const blockNumber = contractAddressVsBlockNumberMap.get(contractAddress);
        const modelRecord = await this.anchorRepository.get(
          Anchor.getGlobalAddress(contractAddress),
        );
        if (modelRecord !== null && modelRecord.lastAnchoredBlockNumber.isLessThan(blockNumber)) {
          Logger.info(`AvailableStateRootHandler::record found: ${modelRecord.anchorGA}`);
          modelRecord.lastAnchoredBlockNumber = blockNumber;
          await this.anchorRepository.save(modelRecord);
          Logger.debug(`AvailableStateRootHandler::saved anchorRepository: ${JSON.stringify(modelRecord)}`);
        }
      });

    await Promise.all(savePromises);
    Logger.debug('AvailableStateRootHandler::saved anchor repository records');
  }
}
