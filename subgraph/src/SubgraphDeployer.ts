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

import * as path from 'path';
import * as fs from 'fs-extra';
import * as mustache from 'mustache';
import { execSync } from 'child_process';

/**
 * Interface for origin subgraph template.
 */
export interface OriginSubgraphArguments {
  originAnchor: string;
  erc20Gateway: string;
}

/**
 * Interface for auxiliary subgraph template.
 */
export interface AuxiliarySubgraphArguments {
  auxiliaryAnchor: string;
  erc20Cogateway: string;
}

/**
 * Class for subgraph deployment.
 */
export default class SubgraphDeployer {
  private graphAdminRPCEndpoint: string;

  private subgraphName: string;

  private subgraphDirectory: string;

  private ipfsEndpoint: string;

  /**
   * Construct subgraph deployment with params.
   *
   * @param graphAdminRPCEndpoint Graph admin rpc endpoint.
   * @param ipfsEndpoint IPFS endpoint.
   * @param subgraphDirectory Directory path of subgraph project.
   * @param subgraphName Name of the subgraph.
   */
  public constructor(
    graphAdminRPCEndpoint: string,
    ipfsEndpoint: string,
    subgraphDirectory: string,
    subgraphName: string,
  ) {
    this.subgraphName = subgraphName;
    this.subgraphDirectory = subgraphDirectory;
    this.graphAdminRPCEndpoint = graphAdminRPCEndpoint;
    this.ipfsEndpoint = ipfsEndpoint;
  }

  /**
   * Deploys the subgraph.
   *
   * @param subgraphArguments Subgraph template arguments.
   */
  public deploy(
    subgraphArguments: OriginSubgraphArguments | AuxiliarySubgraphArguments,
  ): void {
    const mustacheTemplate = fs.readFileSync(this.subgraphTemplatePath());
    const outputFile = this.subgraphYamlFilePath();
    fs.writeFileSync(
      outputFile,
      mustache.render(mustacheTemplate.toString(), subgraphArguments),
    );

    SubgraphDeployer.executeInShell(`cd ${this.subgraphDirectory} && npm ci`);

    try {
      SubgraphDeployer.executeInShell(` cd ${this.subgraphDirectory} && ./node_modules/.bin/graph  remove --node ${this.graphAdminRPCEndpoint} ${this.subgraphName}`);
    } catch (e) {
      // Suppressing the remove local error, because for the first time
      // subgraph will not exists.
    }
    SubgraphDeployer.executeInShell(` cd ${this.subgraphDirectory} && ./node_modules/.bin/graph  create --node ${this.graphAdminRPCEndpoint} ${this.subgraphName}`);

    SubgraphDeployer.executeInShell(`cd ${this.subgraphDirectory} && ./node_modules/.bin/graph  deploy --node ${this.graphAdminRPCEndpoint}/ --ipfs ${this.ipfsEndpoint} ${this.subgraphName}`);
  }

  private subgraphTemplatePath(): string {
    return path.join(
      this.subgraphDirectory,
      'subgraph.yaml.mustache',
    );
  }

  private subgraphYamlFilePath(): string {
    return path.join(
      this.subgraphDirectory,
      'subgraph.yaml',
    );
  }

  /**
   * Executes a command in child process and returns it.
   * It must be used when we need to utilize shell functionality such as pipe, redirects.
   * @param {string} command Command string to execute.
   * @returns Child process that was spawned by this call.
   */
  private static executeInShell(command: string): Buffer {
    return execSync(command, {});
  }
}
