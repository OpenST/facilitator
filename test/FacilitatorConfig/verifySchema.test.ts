import * as fs from 'fs-extra';
import * as path from 'path';
import * as assert from 'assert';
import { FacilitatorConfig } from '../../src/Config/Config';

describe('FacilitatorConfig.verifySchema()', () => {
  let facilitatorConfig;
  let invalidFacilitatorConfig: any;

  it('should pass when facilitator config is valid', async () => {
    facilitatorConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'testdata', 'facilitator-config.json')).toString());
    FacilitatorConfig.verifySchema(facilitatorConfig);
  });

  it('should fail when facilitator config is invalid', async () => {
    // In invalid-facilitator-config.json file, key name `database` is changed to db.

    invalidFacilitatorConfig = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'testdata', 'invalid-facilitator-config.json'),
      ).toString(),
    );

    assert.throws(
      () => FacilitatorConfig.verifySchema(invalidFacilitatorConfig),
      'Invalid facilitator-schema',
    );
  });
});
