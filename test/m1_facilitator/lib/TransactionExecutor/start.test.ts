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

import sinon from 'sinon';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';
import AvatarAccount from '../../../../src/m1_facilitator/manifest/AvatarAccount';
import TransactionExecutor from '../../../../src/m1_facilitator/lib/TransactionExecutor';
import SpyAssert from '../../../test_utils/SpyAssert';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
describe('TransactionExecutor.start()', (): void => {
  let avatarAccount: AvatarAccount;
  let originTransactionExecutor: TransactionExecutor;
  let repositories: Repositories;
  let web3: Web3;
  let toAddress: string;
  let encodedData: string;
  let fakeRawTx: any;
  let nonce: BigNumber;
  let getNonceSpy: any;
  let dequeueSpy: any;
  const gasPrice = new BigNumber('1000000000');

  beforeEach(async (): Promise<void> => {
    repositories = await Repositories.create();
    web3 = new Web3('');
    const web3Account = web3.eth.accounts.create();
    const password = 'password';
    avatarAccount = AvatarAccount.load(
      web3,
      web3Account.encrypt(password),
      password,
    );
    nonce = new BigNumber(1);
    getNonceSpy = sinon.replace(
      avatarAccount,
      'getNonce',
      sinon.fake.resolves(nonce),
    );

    toAddress = '0x0000000000000000000000000000000000000001';
    encodedData = 'encodedData';
    fakeRawTx = {
      encodeABI: (): string => encodedData,
    };

    dequeueSpy = sinon.replace(
      repositories.originTransactionRepository,
      'dequeue',
      sinon.fake.resolves(undefined),
    );

    web3 = sinon.createStubInstance(Web3);
    originTransactionExecutor = new TransactionExecutor(
      repositories.originTransactionRepository,
      web3,
      gasPrice,
      avatarAccount,
    );
  });

  it('should work properly when no transaction is dequeued', async (): Promise<void> => {
    // Overrides infinite loop of setInterval
    const clock = sinon.useFakeTimers();
    await originTransactionExecutor.start();
    SpyAssert.assert(
      // eslint-disable-next-line @typescript-eslint/unbound-method
      dequeueSpy,
      1,
      [[]],
    );

    SpyAssert.assert(
      getNonceSpy,
      0,
      [[]],
    );
    clock.restore();
  });

  it('should work properly when transaction is dequeued', async (): Promise<void> => {
    await originTransactionExecutor.add(toAddress, fakeRawTx);
    // Overrides infinite loop of setInterval
    const clock = sinon.useFakeTimers();
    await originTransactionExecutor.start();
    SpyAssert.assert(
      // eslint-disable-next-line @typescript-eslint/unbound-method
      repositories.originTransactionRepository.dequeue,
      1,
      [[]],
    );

    SpyAssert.assert(
      getNonceSpy,
      0,
      [[web3]],
    );
    clock.restore();
  });

  afterEach(async (): Promise<void> => {
    sinon.restore();
  });
});
