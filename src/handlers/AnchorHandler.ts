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

import { AuxiliaryChainRecordNotFoundException } from '../Exception';
import Logger from '../Logger';
import AuxiliaryChain from '../models/AuxiliaryChain';
import AuxiliaryChainRepository from '../repositories/AuxiliaryChainRepository';
import ContractEntityHandler from './ContractEntityHandler';

/**
 * This class handles Anchor event
 */
export default class AnchorHandler extends ContractEntityHandler<AuxiliaryChain> {
  private auxiliaryChainRepository: AuxiliaryChainRepository;

  private auxiliaryChainID: number;

  /**
   * @param auxiliaryChainRepository Instance of auxiliary chain repository.
   * @param auxiliaryChainID Auxiliary chain Id.
   */
  public constructor(auxiliaryChainRepository: AuxiliaryChainRepository, auxiliaryChainID: number) {
    super();
    this.auxiliaryChainRepository = auxiliaryChainRepository;
    this.auxiliaryChainID = auxiliaryChainID;
  }

  /**
   * This method update latest origin block height.
   *
   * @param transactions Bulk transactions.
   */
  public async persist(transactions: any[]): Promise<AuxiliaryChain[]> {
    Logger.debug('Persisting Anchor records');
    const chainRecord = await this.auxiliaryChainRepository.get(this.auxiliaryChainID);
    let hasChanged = false;
    if (chainRecord === null) {
      Logger.error(`Auxiliary chain record not found for chain ${this.auxiliaryChainID}`);
      throw new AuxiliaryChainRecordNotFoundException(`Cannot find record for auxiliary chain id ${this.auxiliaryChainID}`);
    }

    let anchorBlockHeight = chainRecord.lastOriginBlockHeight;
    transactions
      .filter((transaction): boolean => chainRecord.coAnchorAddress === transaction.contractAddress)
      .forEach((filteredTransaction): void => {
        if (
          anchorBlockHeight === undefined
          || anchorBlockHeight.lt(new BigNumber(filteredTransaction._blockHeight))
        ) {
          anchorBlockHeight = new BigNumber(filteredTransaction._blockHeight);
          hasChanged = true;
        }
      });

    Logger.debug(`Change in latest anchor state root is?:  ${hasChanged}`);
    // No change in block height of interested anchor.
    if (!hasChanged) {
      return [];
    }
    chainRecord.lastOriginBlockHeight = anchorBlockHeight;
    Logger.debug(`Persisting lastOriginBlockHeight to ${anchorBlockHeight}`);
    await this.auxiliaryChainRepository.save(chainRecord);
    // This is returned in the case when higher latest anchored block height is received.
    return [chainRecord];
  }
}
