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
import { Anchor } from 'Mosaic/dist/interacts/Anchor';
import { ERC20Gateway } from 'Mosaic/dist/interacts/ERC20Gateway';
import { UtilityToken } from 'Mosaic/dist/interacts/UtilityToken';
import { Gen0ERC20Cogateway } from 'Mosaic/dist/interacts/Gen0ERC20Cogateway';
import {ERC20I} from "Mosaic/dist/interacts/ERC20I";

// eslint-disable no-object-literal-type-assertion
class Chain {
  public web3: Web3;

  public accounts: string[];

  public deployer: string;


  public constructor() {
    this.web3 = new Web3('');
    this.accounts = [];
    this.deployer = '';
  }
}

class Contract {
  public originAnchor: Anchor;

  public auxiliaryAnchor: Anchor;

  public erc20Gateway: ERC20Gateway;

  public erc20Cogateway: Gen0ERC20Cogateway;

  public utilityTokenMasterCopy: UtilityToken;

  public valueToken: ERC20I;

  public constructor() {
    this.originAnchor = {} as Anchor;
    this.auxiliaryAnchor = {} as Anchor;
    this.erc20Gateway = {} as ERC20Gateway;
    this.erc20Cogateway = {} as Gen0ERC20Cogateway;
    this.utilityTokenMasterCopy = {} as UtilityToken;
    // eslint-disable-next-line no-object-literal-type-assertion
    this.valueToken = {} as ERC20I;
  }
}

export class Shared {
  public origin: Chain;

  public auxiliary: Chain;

  public contracts: Contract;

  public anchorConsensusAddress: string;

  public anchorCoconsensusAddress: string;

  public metachainId: string;

  public constructor() {
    this.origin = new Chain();
    this.auxiliary = new Chain();
    this.contracts = new Contract();
    this.anchorConsensusAddress = '';
    this.anchorCoconsensusAddress = '';
    this.metachainId = '';
  }
}

export default new Shared();
