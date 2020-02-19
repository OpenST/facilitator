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

import Facilitator from '../../../src/m0-facilitator/Facilitator';
import Subscriber from '../../../src/m0-facilitator/subscriptions/Subscriber';
import SpyAssert from '../../test_utils/SpyAssert';

describe('Facilitator.stop()', (): void => {
  it('should stop facilitation', async (): Promise<void> => {
    const originSubscriber = sinon.createStubInstance(Subscriber);
    const auxiliarySubscriber = sinon.createStubInstance(Subscriber);

    const facilitator = new Facilitator(
      originSubscriber as any,
      auxiliarySubscriber as any,
    );
    await facilitator.stop();
    SpyAssert.assert(originSubscriber.unsubscribe, 1, [[]]);
    SpyAssert.assert(auxiliarySubscriber.unsubscribe, 1, [[]]);
  });
});
