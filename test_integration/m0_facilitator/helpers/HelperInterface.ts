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
import { OSTPrime } from '@openst/mosaic-contracts/dist/interacts/OSTPrime';
import { UtilityToken } from '@openst/mosaic-contracts/dist/interacts/UtilityToken';

/**
 * Integration tests run for BaseToken & EIP20Token
 * This interface defines methods which would implement logic which differs for the two cases
 * and are required for running integration tests
 */
export interface HelperInterface {

  /**
   * @return path of script which performs facilitator init
   */
  facilitatorInitScriptPath(): string;

  /**
   * @return path of script which performs facilitator start
   */
  facilitatorStartScriptPath(): string;

  /**
   * Get minted balance, in this case OST Prime
   * @param beneficiary
   * @return balance of beneficiary
   */
  getMintedBalance(beneficiary: string): Promise<BigNumber>;

  /**
   * gives Utility Token Instance, in this case OST Prime
   * @return
   */
  getUtilityTokenInstance(): OSTPrime | UtilityToken;

  /**
   * Perform Wrap to convert base currency of chain to corresponding EIP20 token
   * @param txOption extra data for executing tx
   * @return
   */
  wrapUtilityToken(txOption: any): Promise<void>;

}

