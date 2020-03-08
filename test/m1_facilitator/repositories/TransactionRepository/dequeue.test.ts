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

import BigNumber from 'bignumber.js';

import Util from './util';
import Transaction from '../../../../src/m1_facilitator/models/Transaction';
import Repositories from '../../../../src/m1_facilitator/repositories/Repositories';
import assert from '../../../test_utils/assert';

describe('TransactionRepository::dequeue', (): void => {
  let repos: Repositories;
  let fromAddress: string;
  let toAddress: string;
  let encodedData: string;
  let gasPrice: BigNumber;
  let gas: BigNumber;
  let txHash: string;
  let nonce: BigNumber;
  let createdAt: Date;
  let updatedAt: Date;
  let expectedTransaction: Transaction;

  beforeEach(async (): Promise<void> => {
    repos = await Repositories.create();
    fromAddress = '0xbb9bc244d798123fde783fcc1c72d3bb8c189413';
    toAddress = '0xbb9bc244d798123fde783fcc1c72d3bb8c189413';
    encodedData = 'encodedData';
    gasPrice = new BigNumber(100);
    gas = new BigNumber(200);
    txHash = 'txHash';
    nonce = new BigNumber(1);
    createdAt = new Date();
    updatedAt = new Date();

    expectedTransaction = new Transaction(
      fromAddress,
      toAddress,
      encodedData,
      gasPrice,
      gas,
      undefined,
      txHash,
      nonce,
      createdAt,
      updatedAt,
    );
  });

  it('should successfully dequeue', async (): Promise<void> => {
    expectedTransaction.transactionHash = undefined;
    await repos.originTransactionRepository.save(expectedTransaction);
    const actualTransaction = await repos.originTransactionRepository.dequeue();
    Util.assertTransactionAttributes(actualTransaction as Transaction, expectedTransaction);
  });

  it('should not dequeue if no Transaction with `undefined` transaction hash exists', async (): Promise<void> => {
    await repos.originTransactionRepository.save(expectedTransaction);
    const actualTransaction = await repos.originTransactionRepository.dequeue();
    assert.strictEqual(
      actualTransaction,
      null,
      'Invalid transaction record for processing.',
    );
  });
});
