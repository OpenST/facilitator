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

import assert from '../../../test_utils/assert';
import Transaction from '../../../../src/m1_facilitator/models/Transaction';

const Util = {

  assertTransactionAttributes(actualTransaction: Transaction, expectedTransaction: Transaction): void {
    assert.strictEqual(
      actualTransaction.encodedData,
      expectedTransaction.encodedData,
      `Expected encoded data is: ${expectedTransaction.encodedData} but found to be: ${actualTransaction.encodedData}.`,
    );

    assert.strictEqual(
      actualTransaction.fromAddress,
      expectedTransaction.fromAddress,
      `Expected from address is ${expectedTransaction.fromAddress} but found ${actualTransaction.fromAddress}`,
    );

    assert.strictEqual(
      actualTransaction.toAddress,
      expectedTransaction.toAddress,
      `Expected to address is ${expectedTransaction.toAddress} but found ${actualTransaction.toAddress}`,
    );

    assert.isOk(
      actualTransaction.gas
      && expectedTransaction.gas
      && actualTransaction.gas.eq(expectedTransaction.gas),
      `Expected raw tx is: ${expectedTransaction.gas && expectedTransaction.gas.toString(10)} but found to be:
      ${actualTransaction.gas && actualTransaction.gas.toString(10)}.`,
    );

    assert.isOk(
      actualTransaction.gasPrice
      && expectedTransaction.gasPrice
      && actualTransaction.gasPrice.eq(expectedTransaction.gasPrice),
      `Expected gasPrice is ${actualTransaction.gasPrice && actualTransaction.gasPrice.toString(10)}
      but found ${expectedTransaction.gasPrice && expectedTransaction.gasPrice.toString(10)}`,
    );

    assert.isOk(
      actualTransaction.id && actualTransaction.id.gt(0),
      `Transaction id: ${actualTransaction.id && actualTransaction.id.toString()} should be greater than 0`,
    );

    assert.deepStrictEqual(
      actualTransaction.createdAt,
      expectedTransaction.createdAt,
      `Expected created at should be: ${expectedTransaction.createdAt} but found to be: ${actualTransaction.createdAt} `,
    );

    assert.isNotNull(
      actualTransaction.updatedAt,
      'Updated value should not be null',
    );
  },
};

export default Util;
