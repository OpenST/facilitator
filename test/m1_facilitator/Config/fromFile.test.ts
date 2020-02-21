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

import fs from 'fs-extra';
import yaml from 'js-yaml';
import Config, {
  DBConfig, Avatar, Chain, Metachain,
} from '../../../src/m1_facilitator/Manifest/Manifest';
import assert from '../../test_utils/assert';

interface AccountDetail {
  keystore_path: string;
  keystore_password_path: string;
}

describe('Config.fromFile()', (): void => {
  it('should return correct facilitator config object', async (): Promise<void> => {
    const manifestFilePath = 'testdata/m1_facilitator/facilitator_manifest.yml';
    const inputYamlConfig = yaml.safeLoad(fs.readFileSync(manifestFilePath, 'utf8'));
    const manifest = Config.fromFile(manifestFilePath);

    assert.strictEqual(
      manifest.version,
      inputYamlConfig.version,
      `Expected value is ${inputYamlConfig.version} but found ${manifest.version}`,
    );

    assert.strictEqual(
      manifest.architectureLayout,
      inputYamlConfig.architecture_layout,
      `Expected value is ${inputYamlConfig.architecture_layout} but found ${manifest.architectureLayout}`,
    );

    assert.deepStrictEqual(
      manifest.personas,
      inputYamlConfig.personas,
      `Expected value is ${inputYamlConfig.personas} but found ${manifest.personas}`,
    );

    const originChainObject = new Chain(
      inputYamlConfig.metachain.origin.node_endpoint,
      inputYamlConfig.metachain.origin.graph_ws_endpoint,
      inputYamlConfig.metachain.origin.graph_rpc_endpoint,
      inputYamlConfig.metachain.origin.avatar_account,
    );
    const auxiliaryChainObject = new Chain(
      inputYamlConfig.metachain.auxiliary.node_endpoint,
      inputYamlConfig.metachain.auxiliary.graph_ws_endpoint,
      inputYamlConfig.metachain.auxiliary.graph_rpc_endpoint,
      inputYamlConfig.metachain.auxiliary.avatar_account,
    );
    const expectedMetachain = new Metachain(originChainObject, auxiliaryChainObject);
    assert.deepStrictEqual(
      manifest.metachain,
      expectedMetachain,
      'Mismatch in metachain object',
    );

    const dbConfig = new DBConfig();
    assert.deepStrictEqual(
      manifest.dbConfig,
      dbConfig,
      'Mismatch in dbConfig object.',
    );

    const inputAvatarAccounts: Record<string, Avatar> = {};
    Object.keys(inputYamlConfig.accounts).forEach((address: string): void => {
      const acc = inputYamlConfig.accounts[address] as AccountDetail;
      inputAvatarAccounts[address] = new Avatar(acc.keystore_path, acc.keystore_password_path);
    });
    assert.deepStrictEqual(
      manifest.avatars,
      inputAvatarAccounts,
      'Avatar object mismatch.',
    );

    assert.deepStrictEqual(
      manifest.originContractAddresses,
      inputYamlConfig.origin_contract_addresses,
      `Expected value is ${inputYamlConfig.origin_contract_addresses} but found ${manifest.originContractAddresses}.`,
    );

    assert.deepStrictEqual(
      manifest.facilitateTokens,
      new Set(inputYamlConfig.facilitate_tokens),
      'Mismatch in facilitate token values.',
    );
  });
});
