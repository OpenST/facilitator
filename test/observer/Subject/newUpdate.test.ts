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

import 'mocha';

import NumberUpdate from '../NumberUpdate';

import Subject from '../../../src/observer/Subject';

import assert from '../../test_utils/assert';

interface TestConfigInterface {
  subject: Subject<NumberUpdate>;
}
let config: TestConfigInterface;

describe('Subject::newUpdate', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      subject: new Subject<NumberUpdate>(),
    };
  });

  it('Checks newly added update exists.', async (): Promise<void> => {
    const update1 = new NumberUpdate(1);

    config.subject.newUpdate(update1);

    assert.strictEqual(
      config.subject.updates[0],
      update1,
      'Newly added update exists.',
    );

    const update2 = new NumberUpdate(2);

    config.subject.newUpdate(update2);

    assert.strictEqual(
      config.subject.updates[1],
      update2,
      'Newly added update exists.',
    );
  });

  it('Checks de-duplication of updates.', async (): Promise<void> => {
    const update1 = new NumberUpdate(1);
    config.subject.newUpdate(update1);

    const update2 = new NumberUpdate(2);
    config.subject.newUpdate(update2);

    config.subject.newUpdate(update1);

    assert.strictEqual(
      config.subject.updates.length,
      2,
      'After de-duplication the updates array contains only two entries.',
    );

    assert.strictEqual(
      config.subject.updates[0],
      update2,
      'After de-duplication the position 0 consumes update2.',
    );

    assert.strictEqual(
      config.subject.updates[1],
      update1,
      'After de-duplication, and new addition the position 1 consumes update1.',
    );
  });
});
