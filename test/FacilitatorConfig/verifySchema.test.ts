import fs from 'fs-extra';
import path from 'path';

import { FacilitatorConfig } from '../../src/Config';
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
