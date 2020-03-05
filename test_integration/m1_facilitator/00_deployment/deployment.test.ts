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

import Web3 from 'web3';
import Mosaic from 'Mosaic';

import { AbiItem } from 'web3-utils';
import { Anchor } from 'Mosaic/dist/interacts/Anchor';
import { ERC20Gateway } from 'Mosaic/dist/interacts/ERC20Gateway';
import { UtilityToken } from 'Mosaic/dist/interacts/UtilityToken';
import { Gen0ERC20Cogateway } from 'Mosaic/dist/interacts/Gen0ERC20Cogateway';
import docker from '../docker';
import shared from '../shared';
import Utils from '../utils';

describe('Deployment of contract ', () => {
  before(async (): Promise<void> => {
    const { rpcEndpointOrigin, rpcEndpointAuxiliary } = await docker();
    shared.origin.web3 = new Web3(rpcEndpointOrigin);
    shared.auxiliary.web3 = new Web3(rpcEndpointAuxiliary);

    shared.origin.web3.eth.transactionConfirmationBlocks = 1;
    shared.auxiliary.web3.eth.transactionConfirmationBlocks = 1;

    shared.origin.accounts = await shared.origin.web3.eth.getAccounts();
    shared.auxiliary.accounts = await shared.auxiliary.web3.eth.getAccounts();

    [shared.origin.deployer, shared.anchorConsensusAddress] = shared.origin.accounts;
    [shared.auxiliary.deployer, shared.anchorCoconsensusAddress] = shared.auxiliary.accounts;

    shared.metachainId = shared.origin.web3.utils.randomHex(32);
  });

  it('should deploy anchors', async (): Promise<void> => {
    const anchor = Mosaic.contracts.Anchor;
    shared.contracts.originAnchor = (await Utils.deploy(
      shared.origin.web3,
      anchor.abi as AbiItem[],
      anchor.bin,
      [],
      shared.origin.deployer,
    )) as Anchor;

    shared.contracts.auxiliaryAnchor = (await Utils.deploy(
      shared.auxiliary.web3,
      anchor.abi as AbiItem[],
      anchor.bin,
      [],
      shared.auxiliary.deployer,
    )) as Anchor;
  });

  it('should deploy gateways', async (): Promise<void> => {
    const gateway = Mosaic.contracts.ERC20Gateway;
    const cogateway = Mosaic.contracts.Gen0ERC20Cogateway;

    shared.contracts.erc20Gateway = (await Utils.deploy(
      shared.origin.web3,
      gateway.abi as AbiItem[],
      gateway.bin,
      [],
      shared.origin.deployer,
    )) as ERC20Gateway;

    shared.contracts.erc20Cogateway = (await Utils.deploy(
      shared.auxiliary.web3,
      cogateway.abi as AbiItem[],
      cogateway.bin,
      [],
      shared.auxiliary.deployer,
    )) as Gen0ERC20Cogateway;
  });

  it('should deploy utility token master copy', async (): Promise<void> => {
    const utilityToken = Mosaic.contracts.UtilityToken;
    shared.contracts.utilityTokenMasterCopy = (await Utils.deploy(
      shared.auxiliary.web3,
      utilityToken.abi as AbiItem[],
      utilityToken.bin,
      [],
      shared.auxiliary.deployer,
    )) as UtilityToken;
  });
});
