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


import * as web3utils from 'web3-utils';

import Message from '../../../src/models/Message';
import assert from '../../test_utils/assert';

describe('AuxiliaryChain::get', (): void => {
  const message = new Message(
    '0x000000000000000000000000000000000000000000000000000001',
  );

  message.secret = '1';

  it('should return true when hashlock is '
    + 'generated from correct secret', async (): Promise<void> => {
    assert(message.secret !== undefined);

    const generatedHashLock = web3utils.keccak256(message.secret as string).toString();
    message.hashLock = generatedHashLock;
    const result = message.isValidSecret();

    assert.strictEqual(
      result,
      true,
      'Hashlock generated from secret should be same',
    );
  });

  it('should return false when for invalid secret', async (): Promise<void> => {
    message.hashLock = '12345';

    const result = message.isValidSecret();

    assert.strictEqual(
      result,
      false,
      'Hashlock generated from secret should be different',
    );
  });
});
