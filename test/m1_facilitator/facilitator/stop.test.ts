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
import TransactionExecutor
  from '../../../src/m1_facilitator/lib/TransactionExecutor';
import Subscriber from '../../../src/common/subscriptions/Subscriber';
import Facilitator from '../../../src/m1_facilitator/Facilitator';
import SpyAssert from '../../test_utils/SpyAssert';

describe('Facilitator:stop ', (): void => {
  it('should stop facilitator', async (): Promise<void> => {
    const originTransactionExecutor = sinon.createStubInstance(TransactionExecutor);

    const auxiliaryTransactionExecutor = sinon.createStubInstance(TransactionExecutor);

    const originSubscriber = sinon.createStubInstance(Subscriber);
    const auxiliarySubscriber = sinon.createStubInstance(Subscriber);

    await new Facilitator(
      originTransactionExecutor as any,
      auxiliaryTransactionExecutor as any,
      originSubscriber as any,
      auxiliarySubscriber as any,
    ).stop();

    SpyAssert.assert(
      originTransactionExecutor.stop,
      1,
      [[]],
    );
    SpyAssert.assert(
      auxiliaryTransactionExecutor.stop,
      1,
      [[]],
    );
    SpyAssert.assert(
      originSubscriber.unsubscribe,
      1,
      [[]],
    );
    SpyAssert.assert(
      auxiliarySubscriber.unsubscribe,
      1,
      [[]],
    );
  });
});
