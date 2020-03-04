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

import Facilitator from '../../../src/m0_facilitator/Facilitator';
import SpyAssert from '../../test_utils/SpyAssert';
import Subscriber from '../../../src/common/subscriptions/Subscriber';

describe('Facilitator.start()', (): void => {
  it('should start facilitation', async (): Promise<void> => {
    const originSubscriber = sinon.createStubInstance(Subscriber);
    const auxiliarySubscriber = sinon.createStubInstance(Subscriber);

    // Overrides infinite loop of setInterval
    const clock = sinon.useFakeTimers();
    const facilitator = new Facilitator(
      originSubscriber as any,
      auxiliarySubscriber as any,
    );
    await facilitator.start();
    SpyAssert.assert(originSubscriber.subscribe, 1, [[]]);
    SpyAssert.assert(auxiliarySubscriber.subscribe, 1, [[]]);
    clock.restore();
    sinon.restore();
  });
});
