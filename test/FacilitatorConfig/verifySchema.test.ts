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


import fs from 'fs-extra';
import path from 'path';

import { FacilitatorConfig } from '../../src/Config/Config';
import { InvalidFacilitatorConfigException } from '../../src/Exception';
import assert from '../test_utils/assert';

describe('FacilitatorConfig.verifySchema()', (): void => {
  let facilitatorConfig;
  let invalidFacilitatorConfig: any;

  it('should pass when facilitator config is valid', async (): Promise<void> => {
    facilitatorConfig = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'testdata', 'facilitator-config.json')).toString(),
    );
    FacilitatorConfig.verifySchema(facilitatorConfig);
  });

  it('should fail when facilitator config is invalid', async (): Promise<void> => {
    // In invalid-facilitator-config.json file, key name `database` is changed to db.

    invalidFacilitatorConfig = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'testdata', 'invalid-facilitator-config.json'),
      ).toString(),
    );

    assert.throws(
      (): void => FacilitatorConfig.verifySchema(invalidFacilitatorConfig),
      InvalidFacilitatorConfigException,
    );
  });
});
