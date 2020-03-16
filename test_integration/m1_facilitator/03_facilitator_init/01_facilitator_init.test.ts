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

import { execSync } from 'child_process';
import jsYaml from 'js-yaml';
import fs from 'fs';
import * as web3Utils from 'web3-utils';

import path from 'path';
import generateFacilitatorManifest from './FacilitatorManifestGenerator';
import shared from '../shared';

describe('Facilitator init ', (): void => {
  it('should perform facilitator init', async (): Promise<void> => {
    const manifestFilePath = path.join(__dirname, '..', 'manifest.yaml');
    const executablePath = path.join(__dirname, '..', '..', '..');
    const command = `sh ${executablePath}/facilitator_m1 init --manifest ${manifestFilePath} -f`;
    const manifest = generateFacilitatorManifest(shared);
    fs.writeFileSync(manifestFilePath, jsYaml.dump(manifest));
    execSync(command, {
      cwd: executablePath,
      stdio: ['inherit', 'inherit', 'inherit'],
    });

    const originAvatar = manifest.metachain.origin.avatar_account;
    const auxiliaryAvatar = manifest.metachain.auxiliary.avatar_account;

    // Funding facilitator avatar account
    await shared.origin.web3.eth.sendTransaction(
      {
        from: shared.origin.deployer,
        to: originAvatar,
        value: web3Utils.toWei('1', 'ether'),
      },
    );
    // Funding facilitator avatar account
    await shared.auxiliary.web3.eth.sendTransaction(
      {
        from: shared.auxiliary.deployer,
        to: auxiliaryAvatar,
        value: web3Utils.toWei('1', 'ether'),
      },
    );
  });
});
