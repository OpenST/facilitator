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

import axios from 'axios';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import Command from '../../../src/m1_facilitator/commands/Command';
import Manifest from '../../../src/m1_facilitator/manifest/Manifest';

// Threshold amount in atto below which facilitator account will be funded from faucet.
const FACILITATOR_ACCOUNT_THRESHOLD = new BigNumber('1000000000000000000');

const FAUCET_URL = 'https://faucet.mosaicdao.org';

const HADAPSAR = '1405';

/*
 * Returns balance of facilitator account in atto.
 */
async function checkBalance(account: string, web3: Web3): Promise<BigNumber> {
  const accountBalance = await web3.eth.getBalance(account);
  return new BigNumber(accountBalance);
}

export default class FundFacilitatorAccount implements Command {
  private manifestPath: string;

  /**
   * Construct FundFacilitatorAccount instance with params.
   *
   * @param manifestPath Path of manifest file.
   */
  public constructor(manifestPath: string) {
    this.manifestPath = manifestPath;
  }

  /**
   * Executes fund_facilitator_account command.
   */
  public async execute(): Promise<void> {
    const manifest = Manifest.fromFile(this.manifestPath);
    const account = manifest.metachain.auxiliaryChain.avatarAccount;
    if ((await checkBalance(account, manifest.metachain.auxiliaryChain.web3))
      .lt(FACILITATOR_ACCOUNT_THRESHOLD)) {
      await axios.post(
        FAUCET_URL,
        {
          beneficiary: `${account}@${HADAPSAR}`,
        },
      );
    }
  }
}
