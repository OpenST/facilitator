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

import { execSync } from 'child_process';
import shared from '../shared';
import endpoints from '../endpoints';

describe('Deploy origin and auxiliary subgraph  ', (): void => {
  it('should deploy origin subgraph', (): void => {
    const originAchorAddress = shared.contracts.originAnchor.address;
    const gatewayAddress = shared.contracts.erc20Gateway.address;
    const graphAdminRpcEndpoint = endpoints.origin.graph_rpc_admin;
    const ipfsEndpoint = endpoints.origin.ipfs;

    const command = `npm run deploy:subgraph:origin ${originAchorAddress} ${gatewayAddress} ${graphAdminRpcEndpoint} ${ipfsEndpoint}`;

    execSync(
      command,
    );
  });

  it('should deploy auxiliary subgraph', (): void => {
    const auxiliaryAchorAddress = shared.contracts.auxiliaryAnchor.address;
    const cogatewayAddress = shared.contracts.erc20Cogateway.address;
    const graphAdminRpcEndpoint = endpoints.auxilary.graph_rpc_admin;
    const ipfsEndpoint = endpoints.auxilary.ipfs;

    const command = `npm run deploy:subgraph:auxiliary ${auxiliaryAchorAddress} ${cogatewayAddress} ${graphAdminRpcEndpoint} ${ipfsEndpoint}`;

    execSync(command);
  });
});
