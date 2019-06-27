import { assert } from 'chai';
import * as path from 'path';
import Utils from '../../src/Utils';
import { FacilitatorConfig } from '../../src/Config';

describe('FacilitatorConfig.constructor()', () => {
  it('should initialize instance variable', async () => {
    const config = Utils.getJsonDataFromPath(
      path.join(__dirname, 'testdata', 'facilitator-config.json'),
    );

    const facilitatorConfig: FacilitatorConfig = new FacilitatorConfig(config);

    assert.strictEqual(
      facilitatorConfig.database !== undefined,
      true,
      'Database instance variable should be defined',
    );
    assert.strictEqual(
      facilitatorConfig.chains !== undefined,
      true,
      'Chains instance variable should be defined',
    );
    assert.strictEqual(
      facilitatorConfig.encryptedAccounts !== undefined,
      true,
      'Encrypted accounts instance variable should be defined',
    );
  });

  it('should not initialize instance variable when config is empty', async () => {
    const facilitatorConfig: FacilitatorConfig = new FacilitatorConfig('');
    assert.isEmpty(
      facilitatorConfig.database,
      'Database instance variable should be empty',
    );
    assert.isEmpty(
      facilitatorConfig.chains,
      'Chains instance variable should be empty',
    );
    assert.isEmpty(
      facilitatorConfig.encryptedAccounts,
      'Encrypted instance variable should be empty',
    );
  });
});
