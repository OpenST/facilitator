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

import waitPort = require('wait-port');

const originPort = 8546;
const auxiliaryPort = 8547;

const asyncSleep = async (ms: number): Promise<number> => new Promise(
  resolve => setTimeout(resolve, ms),
);

const docker = async (): Promise<{
  rpcEndpointOrigin: string;
  rpcEndpointAuxiliary: string;
}> => {
  // @ts-ignore
  const waitForOriginNode = waitPort({ port: originPort, output: 'silent' });
  // @ts-ignore
  const waitForAuxiliaryNode = waitPort({ port: auxiliaryPort, output: 'silent' });
  return Promise.all([waitForOriginNode, waitForAuxiliaryNode]).then(
    // even after the ports are available the nodes need a bit of time to get online
    async () => asyncSleep(5000),
  ).then(() => ({
    rpcEndpointOrigin: `http://localhost:${originPort}`,
    rpcEndpointAuxiliary: `http://localhost:${auxiliaryPort}`,
  }));
};

export default docker;
