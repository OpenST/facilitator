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

import Web3 from 'web3';
import Command from './Command';
import Manifest from '../manifest/Manifest';

const BN = require('bn.js');
const axios = require('axios');

const THRESHOLD = new BN(50);

async function fundFromFaucet(beneficiary: string, chain: string): Promise<void> {
  console.log(`Funding ${beneficiary} for chain ${chain}`);
  const response = await axios.post(
    'https://faucet.mosaicdao.org',
    {
      beneficiary: `${beneficiary}@${chain}`,
    },
  );
  console.log(`Transaction hash is ${response.data.txHash}`);
}

async function checkBalance(account: string, auxWeb3: Web3): Promise<void> {
  const auxAvatarBalance = await auxWeb3.eth.getBalance(account);
  console.log('Auxilary Avatar Balance ==>', auxAvatarBalance.toString());
  if (new BN(auxAvatarBalance) < THRESHOLD) {
    fundFromFaucet(account, '1405');
  }
}

export default class FundAvatar implements Command {
  private manifestPath: string;

  /**
   * Construct FundAvatar instance with params.
   *
   * @param manifestPath Path of manifest file.
   */
  public constructor(manifestPath: string) {
    this.manifestPath = manifestPath;
  }

  /**
   * Executes fundAvatar command
   */
  public async execute(): Promise<void> {
    const manifest = Manifest.fromFile(this.manifestPath);
    Object.keys(manifest.avatarAccounts).forEach((address: string): void => {
      const acc = manifest.avatarAccounts[address];
      checkBalance(
        acc.address,
        manifest.metachain.auxiliaryChain.web3,
      );
    });
  }
}
