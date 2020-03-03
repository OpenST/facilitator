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

import * as Web3Utils from 'web3-utils';

import { Accounts } from 'web3-eth-accounts';

export default class Utils {
  public static generateRundomAddress(): string {
    const accounts = new Accounts(null);
    const account = accounts.create(Web3Utils.randomHex(32));
    return account.address;
  }
}
