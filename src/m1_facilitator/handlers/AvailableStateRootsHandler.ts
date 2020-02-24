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
import AnchorRepository from '../repositories/AnchorRepository';
import Utils from '../../common/Utils';
import Anchor from '../models/Anchor';

/** Represents record of AvailableStateRootsEntity. */
interface AvailableStateRootsEntityInterface {
  contractAddress: string;
  blockNumber: string;
}

/**
 * This class handles the updates from AvailableStateRoots entity.
 */
export default class AvailableStateRootsHandler {
  /* Instance of anchor repository. */
  private anchorRepository: AnchorRepository;

  /**
   * Construct AvailableStateRootsHandler with the params.
   *
   * @param anchorRepository Instance of Anchor repository.
   */
  public constructor(anchorRepository: AnchorRepository) {
    this.anchorRepository = anchorRepository;
  }

  /**
   * Handles the AvailableStateRoots entity records.
   *
   * @param records List of AvailableStateRoots.
   */
  public async handle(records: AvailableStateRootsEntityInterface[]): Promise<void> {
    const contractAddressVsBlockNumberMap = new Map();

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
          modelRecord.lastAnchoredBlockNumber = blockNumber;
          await this.anchorRepository.save(modelRecord);
        }
      });

    await Promise.all(savePromises);
  }
}
