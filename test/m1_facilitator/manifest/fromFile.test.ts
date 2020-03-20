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
import Web3 from 'web3';
import Config, {
  DBConfig, Chain, Metachain, ArchitectureLayout,
} from '../../../src/m1_facilitator/manifest/Manifest';
import assert from '../../test_utils/assert';
import AvatarAccount from '../../../src/m1_facilitator/manifest/AvatarAccount';
import Utils from '../../../src/common/Utils';
import Directory from '../../../src/m1_facilitator/Directory';

interface AccountDetail {
  keystore_path: string;
  keystore_password_path: string;
}

function assertChainObject(actualChainObject: Chain, expectChainObject: Chain): void {
  assert.deepStrictEqual(
    actualChainObject.nodeEndpoint,
    expectChainObject.nodeEndpoint,
    'Mismatch in nodeEndpoint.',
  );

  assert.deepStrictEqual(
    actualChainObject.graphWsEndpoint,
    expectChainObject.graphWsEndpoint,
    'Mismatch in graphWsEndpoint.',
  );

  assert.deepStrictEqual(
    actualChainObject.graphRpcEndpoint,
    expectChainObject.graphRpcEndpoint,
    'Mismatch in graphRpcEndpoint.',
  );

  assert.deepStrictEqual(
    actualChainObject.avatarAccount,
    expectChainObject.avatarAccount,
    'Mismatch in avatarAccount.',
  );
}

describe('Config.fromFile()', (): void => {
  it('should return correct facilitator config object', async (): Promise<void> => {
    const manifestFilePath = 'testdata/m1_facilitator/facilitator_manifest.yml';
    const inputYamlConfig = yaml.safeLoad(fs.readFileSync(manifestFilePath, 'utf8'));
    const manifest = Config.fromFile(manifestFilePath);

    assert.strictEqual(
      manifest.version,
      inputYamlConfig.version,
      `Expected value is ${inputYamlConfig.version} but found ${manifest.version}.`,
    );

    assert.strictEqual(
      manifest.architectureLayout,
      inputYamlConfig.architecture_layout,
      `Expected value is ${inputYamlConfig.architecture_layout} but found ${manifest.architectureLayout}.`,
    );

    assert.deepStrictEqual(
      manifest.personas,
      inputYamlConfig.personas,
      `Expected value is ${inputYamlConfig.personas} but found ${manifest.personas}.`,
    );

    const originChainObject = new Chain(
      inputYamlConfig.metachain.origin.node_endpoint,
      inputYamlConfig.metachain.origin.graph_ws_endpoint,
      inputYamlConfig.metachain.origin.graph_rpc_endpoint,
      inputYamlConfig.metachain.origin.avatar_account,
      new Web3(inputYamlConfig.metachain.origin.node_endpoint),
    );
    const auxiliaryChainObject = new Chain(
      inputYamlConfig.metachain.auxiliary.node_endpoint,
      inputYamlConfig.metachain.auxiliary.graph_ws_endpoint,
      inputYamlConfig.metachain.auxiliary.graph_rpc_endpoint,
      inputYamlConfig.metachain.auxiliary.avatar_account,
      new Web3(inputYamlConfig.metachain.auxiliary.node_endpoint),
    );
    const expectedMetachain = new Metachain(originChainObject, auxiliaryChainObject);
    assertChainObject(manifest.metachain.originChain, expectedMetachain.originChain);
    assertChainObject(manifest.metachain.auxiliaryChain, expectedMetachain.auxiliaryChain);

    const dbConfig = new DBConfig();
    dbConfig.path = Directory.getFacilitatorDatabaseFile(
      ArchitectureLayout.MOSAIC_0_14_GEN_1,
      inputYamlConfig.origin_contract_addresses.erc20_gateway,
    );
    assert.deepStrictEqual(
      manifest.dbConfig,
      dbConfig,
      'Mismatch in dbConfig object.',
    );

    const inputAvatarAccounts: Record<string, AvatarAccount> = {};
    Object.keys(inputYamlConfig.accounts).forEach((address: string): void => {
      const acc = inputYamlConfig.accounts[address] as AccountDetail;
      const keystore = fs.readFileSync(acc.keystore_path).toString().trim();
      const password = fs.readFileSync(acc.keystore_password_path).toString().trim();
      inputAvatarAccounts[address] = AvatarAccount.load(new Web3(''), JSON.parse(keystore), password);
    });
    assert.deepStrictEqual(
      manifest.avatarAccounts,
      inputAvatarAccounts,
      'Avatar object mismatch.',
    );

    assert.deepStrictEqual(
      manifest.originContractAddresses,
      inputYamlConfig.origin_contract_addresses,
      `Expected value is ${inputYamlConfig.origin_contract_addresses} but found ${manifest.originContractAddresses}.`,
    );

    const checksumTokens = inputYamlConfig.facilitate_tokens.map(
      (token: string): string => Utils.toChecksumAddress(token),
    );
    assert.deepStrictEqual(
      manifest.facilitateTokens,
      new Set(checksumTokens),
      'Mismatch in facilitate token values.',
    );
  });
});
