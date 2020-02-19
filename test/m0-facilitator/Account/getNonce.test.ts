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

import BigNumber from 'bignumber.js';
import Account from '../../../src/m0-facilitator/Account';
import assert from '../../test_utils/assert';
import SpyAssert from '../../test_utils/SpyAssert';

describe('Account.getNonce', (): void => {
  let dummyInitialNonce: BigNumber;
  let web3MockObject: any;

  beforeEach((): void => {
    dummyInitialNonce = new BigNumber('1');
    web3MockObject = {
      eth: {
        getTransactionCount: sinon.fake.resolves(dummyInitialNonce),
      },
    };
  });

  afterEach(async (): Promise<void> => {
    sinon.restore();
  });

  it('should return nonce by calling getTransactionCount on web3', async (): Promise<void> => {
    const accountObject: Account = new Account(
      '0x0000000000000000000000000000000000000001',
    );
    const nonce: BigNumber = await accountObject.getNonce(web3MockObject);
    assert.deepEqual(
      nonce,
      dummyInitialNonce,
      'nonce should match',
    );
    SpyAssert.assert(
      web3MockObject.eth.getTransactionCount,
      1,
      [[accountObject.address, 'pending']],
    );
  });

  it('should return incremented nonce from in-memory storage', async (): Promise<void> => {
    const accountObject: Account = new Account(
      '0x0000000000000000000000000000000000000002',
    );
    // call once to have it fetch nonce from web3
    await accountObject.getNonce(web3MockObject);
    // call second time to fetch incremented nonce from in-memory
    const nonce: BigNumber = await accountObject.getNonce(web3MockObject);
    assert.deepEqual(
      nonce,
      dummyInitialNonce.add(1),
      'nonce should match',
    );
    SpyAssert.assert(
      web3MockObject.eth.getTransactionCount,
      1,
      [[accountObject.address, 'pending']],
    );
  });
});
