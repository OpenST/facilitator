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


import * as path from 'path';
import BigNumber from 'bignumber.js';
import { HelperInterface } from './HelperInterface';
import Utils from '../Utils';
import { OSTPrime } from '@openst/mosaic-contracts/dist/interacts/OSTPrime';
import { TransactionObject } from '@openst/mosaic-contracts/dist/interacts/types';
import Logger from '../../../src/m0-facilitator/Logger';

export default class BaseTokenHelper implements HelperInterface {

  /**
   * @return path of script which performs facilitator init
   */
  facilitatorInitScriptPath(): string {
    return path.join(__dirname, '../scripts/base_token/facilitator_init.sh');
  }

  /**
   * @return path of script which performs facilitator start
   */
  facilitatorStartScriptPath(): string {
    return path.join(__dirname, '../scripts/base_token/facilitator_start.sh');
  }

  /**
   * Get minted balance, in this case OST Prime
   * @param beneficiary
   * @return balance of beneficiary
   */
  getMintedBalance(beneficiary: string): Promise<BigNumber> {
    const utils = new Utils();
    return utils.getOSTPrimeBalance(beneficiary);
  }

  /**
   * gives Utility Token Instance, in this case OST Prime
   * @return
   */
  getUtilityTokenInstance(): OSTPrime {
    const utils = new Utils();
    return utils.getSimpleTokenPrimeInstance();
  }

  /**
   * Perform Wrap to convert base currency of chain to corresponding EIP20 token
   * @param txOption extra data for executing tx
   * @return
   */
  async wrapUtilityToken(txOption: any): Promise<void> {
    Logger.debug('submitting wrapping OSTPrime tx.');
    const wrapRawTx: TransactionObject<boolean> = this.getUtilityTokenInstance().methods.wrap();
    await Utils.sendTransaction(
      wrapRawTx,
      txOption,
    );
  }

}
