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

import path from 'path';
import fs from 'fs';
import jsYaml from 'js-yaml';
import { execSync } from 'child_process';
import shared from '../shared';
import generateFacilitatorManifest
  from '../03_facilitator_init/FacilitatorManifestGenerator';

describe('Start facilitator', () => {
  it.skip('should start facilitator', () => {
    const manifestFilePath = path.join(__dirname, '..', 'manifest.yaml');
    const executablePath = path.join(__dirname, '..', '..', '..');
    const command = `sh ${executablePath}/facilitator_m1 start --manifest ${manifestFilePath}`;

    const manifest = generateFacilitatorManifest(shared);
    fs.writeFileSync(manifestFilePath, jsYaml.dump(manifest));
    execSync(command, {
      cwd: executablePath,
    });
  });
});
