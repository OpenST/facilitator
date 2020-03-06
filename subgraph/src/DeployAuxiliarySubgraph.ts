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

const auxiliarySubgraphDirectory = path.join(__dirname, '../auxiliary');
const auxiliarySubgraphName = 'mosaic/aux-erc20gateway';

/**
 * This function parse command line argument and returns the value.
 * This function throws error if input validation fails.
 */
function parseArguments(): {
  auxiliaryAnchor: string;
  erc20Cogateway: string;
  graphAdminRPCEndpoint: string;
  ipfsEndpoint: string;
} {
  assert(process.argv.length === 6);

  const auxiliaryAnchor = process.argv[2];
  const erc20Cogateway = process.argv[3];
  const graphAdminRPCEndpoint = process.argv[4];
  const ipfsEndpoint = process.argv[5];

  if (!web3Utils.isAddress(auxiliaryAnchor)) {
    throw new Error(`Invalid auxiliary anchor ${auxiliaryAnchor}`);
  }

  if (!web3Utils.isAddress(erc20Cogateway)) {
    throw new Error(`Invalid cogateway address ${erc20Cogateway}`);
  }
  return {
    auxiliaryAnchor,
    erc20Cogateway,
    graphAdminRPCEndpoint,
    ipfsEndpoint,
  };
}
try {
  const params = parseArguments();

  /* Deploy subgraph */
  new SubgraphDeployer(
    params.graphAdminRPCEndpoint,
    params.ipfsEndpoint,
    auxiliarySubgraphDirectory,
    auxiliarySubgraphName,
  ).deploy({
    auxiliaryAnchor: params.auxiliaryAnchor,
    erc20Cogateway: params.erc20Cogateway,
  });
} catch (e) {
  console.log('Error in deployment of subgraph ', e.message);
}
