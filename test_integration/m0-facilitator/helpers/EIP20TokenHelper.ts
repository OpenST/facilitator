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
import { UtilityToken } from '@openst/mosaic-contracts/dist/interacts/UtilityToken';

import { HelperInterface } from './HelperInterface';
import Utils from '../Utils';
import Logger from '../../../src/m0-facilitator/Logger';

export default class EIP20TokenHelper implements HelperInterface {

  /**
   * @return path of script which performs facilitator init
   */
  facilitatorInitScriptPath(): string {
    return path.join(__dirname, '../scripts/eip20_token/facilitator_init.sh');
  }

  /**
   * @return path of script which performs facilitator start
   */
  facilitatorStartScriptPath(): string {
    return path.join(__dirname, '../scripts/eip20_token/facilitator_start.sh');
  }

  /**
   * Get minted balance, in this case OST Prime
   * @param beneficiary
   * @return balance of beneficiary
   */
  getMintedBalance(beneficiary: string): Promise<BigNumber> {
    const utils = new Utils();
    return utils.getUtilityTokenBalance(beneficiary);
  }

  /**
   * gives Utility Token Instance, in this case OST Prime
   * @return
   */
  getUtilityTokenInstance(): UtilityToken {
    const utils = new Utils();
    return utils.getUtilityTokenInstance();
  }

  /**
   * Perform Wrap to convert base currency of chain to corresponding EIP20 token
   * Here it is not required
   * @param txOption extra data for executing tx
   * @return
   */
  wrapUtilityToken(txOption: any): Promise<void> {
    // Do nothing here
    Logger.debug('ignoring txOption for eip20Token', txOption);
    return new Promise(((resolve) => {
      resolve();
    }));
  }

}
