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
import ContractEntityHandler from './ContractEntityHandler';
import {
  AuxiliaryChain,
  AuxiliaryChainRepository,
} from '../repositories/AuxiliaryChainRepository';
import Logger from '../Logger';
import { AuxiliaryChainRecordNotFoundException } from '../Exception';

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
    const chainRecord = await this.auxiliaryChainRepository.get(this.auxiliaryChainID);
    let hasChanged = false;
    if (chainRecord === null) {
      throw new AuxiliaryChainRecordNotFoundException(`Cannot find record for auxiliary chain id ${this.auxiliaryChainID}`);
    }

    let anchorBlockHeight = chainRecord.lastOriginBlockHeight;
    transactions
      .filter(transaction => chainRecord.anchorAddress === transaction.contractAddress)
      .forEach((filteredTransaction) => {
        if (
          anchorBlockHeight === undefined
          || anchorBlockHeight.lt(new BigNumber(filteredTransaction._blockHeight))
        ) {
          anchorBlockHeight = new BigNumber(filteredTransaction._blockHeight);
          hasChanged = true;
        }
      });

    // No change in block height of interested anchor.
    if (!hasChanged) {
      return [];
    }
    await this.auxiliaryChainRepository.update(chainRecord);
    // This is returned in the case when higher latest anchored block height is received.
    return [chainRecord];
  }

  /**
   * This method defines action on receiving auxiliary chain model.
   *
   * @param auxiliaryChains array of instances of auxiliaryChains object.
   */
  public async handle(auxiliaryChains: AuxiliaryChain[]): Promise<void> {
    Logger.info(`AuxiliaryChains  : ${auxiliaryChains}`);
    return Promise.resolve();
  }
}
