// Copyright 2019 OpenST Ltd.
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
//
// ----------------------------------------------------------------------------


import sinon from 'sinon';
import Web3 from 'web3';

import Account from '../../src/Account';
import assert from '../test_utils/assert';
import SpyAssert from '../test_utils/SpyAssert';

describe('Unlock', (): void => {
  let web3: Web3;
  let validPassword: string;
  let accountCreationResponse: Account;
  let accountObject: Account;

  beforeEach((): void => {
    web3 = new Web3(null);
    validPassword = 'validPassword';
    accountCreationResponse = Account.create(web3, validPassword);
    accountObject = new Account(
      accountCreationResponse.address,
      accountCreationResponse.encryptedKeyStore,
    );
  });

  it('should unlock successfully with valid password', (): void => {
    const dummyAccount = web3.eth.accounts.create();
    sinon.replace(
      web3.eth.accounts,
      'decrypt',
      sinon.fake.returns(dummyAccount),
    );
    sinon.replace(
      web3.eth.accounts.wallet,
      'add',
      sinon.fake.returns(dummyAccount),
    );
    assert.strictEqual(
      accountObject.unlock(web3, validPassword),
      true,
      'should return true for successful unlock',
    );
    SpyAssert.assert(
      web3.eth.accounts.decrypt,
      1,
      [[accountObject.encryptedKeyStore, validPassword]],
    );
    SpyAssert.assert(
      web3.eth.accounts.wallet.add,
      1,
      [[dummyAccount]],
    );
  });

  it('should not unlock with invalid password', (): void => {
    const inValidPassword = 'inValidPassword';

    assert.strictEqual(
      accountObject.unlock(web3, inValidPassword),
      false,
      'should return false for unsuccessful unlock',
    );
  });
});
