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


import {
  ArchitectureLayout,
  Personas,
} from '../../../src/m1_facilitator/manifest/Manifest';
import endpoints from '../endpoints';
import { Shared } from '../shared';

const generateFacilitatorManifest = (shared: Shared) => ({
  version: 'v0.14',
  architecture_layout: ArchitectureLayout.MOSAIC_0_14_GEN_1,
  personas: [Personas.FACILITATOR],
  metachain:
    {
      origin:
        {
          avatar_account: '0x296a65814a2c07bf7a8ee310a212a4796dc0123a',
          node_endpoint: endpoints.origin.chain,
          graph_ws_endpoint: `${endpoints.origin.graph_ws}/subgraphs/name/mosaic/origin-erc20gateway`,
          graph_rpc_endpoint: `${endpoints.origin.graph_rpc}/subgraphs/name/mosaic/origin-erc20gateway`,
        },
      auxiliary:
        {
          avatar_account: '0x61bd2fd5c5ebb902b2b86d13f0b00b353ceec017',
          node_endpoint: endpoints.auxilary.chain,
          graph_ws_endpoint: `${endpoints.auxilary.graph_ws}/subgraphs/name/mosaic/aux-erc20gateway`,
          graph_rpc_endpoint: `${endpoints.auxilary.graph_rpc}/subgraphs/name/mosaic/aux-erc20gateway`,
        },
    },
  accounts:
    {
      '0x296a65814a2c07bf7a8ee310a212a4796dc0123a':
        {
          keystore_path: 'testdata/m1_facilitator/origin_keystore.json',
          keystore_password_path: 'testdata/m1_facilitator/origin_password',
        },
      '0x61bd2fd5c5ebb902b2b86d13f0b00b353ceec017':
        {
          keystore_path: 'testdata/m1_facilitator/aux_keystore.json',
          keystore_password_path: 'testdata/m1_facilitator/aux_password',
        },
    },
  origin_contract_addresses: { erc20_gateway: shared.contracts.erc20Gateway.address },
  facilitate_tokens: [],

});

export default generateFacilitatorManifest;
