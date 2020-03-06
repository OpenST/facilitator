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
import assert from 'assert';

import * as web3Utils from 'web3-utils';
import SubgraphDeployer from './SubgraphDeployer';

const originSubgraphDirectory = path.join(__dirname, '../origin');
const originSubgraphName = 'mosaic/origin-erc20gateway';

/**
 * This function parse command line argument and returns the value.
 * This function throws error if input validation fails.
 */
function parseArguments(): {
  originAnchor: string;
  erc20Gateway: string;
  graphAdminRPCEndpoint: string;
  ipfsEndpoint: string;
} {
  assert(process.argv.length === 6);

  const originAnchor = process.argv[2];
  const erc20Gateway = process.argv[3];
  const graphAdminRPCEndpoint = process.argv[4];
  const ipfsEndpoint = process.argv[5];

  if (!web3Utils.isAddress(originAnchor)) {
    throw new Error(`Invalid origin anchor ${originAnchor}`);
  }

  if (!web3Utils.isAddress(erc20Gateway)) {
    throw new Error(`Invalid gateway address ${erc20Gateway}`);
  }

  return {
    originAnchor,
    erc20Gateway,
    graphAdminRPCEndpoint,
    ipfsEndpoint,
  };
}

try {
  const params = parseArguments();

  new SubgraphDeployer(
    params.graphAdminRPCEndpoint,
    params.ipfsEndpoint,
    originSubgraphDirectory,
    originSubgraphName,
  ).deploy({
    originAnchor: params.originAnchor,
    erc20Gateway: params.erc20Gateway,
  });
} catch (e) {
  console.log('Error in deployment of subgraph ', e.message);
}
