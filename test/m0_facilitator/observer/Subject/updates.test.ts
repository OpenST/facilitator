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

import Subject from '../../../../src/m0_facilitator/observer/Subject';
import assert from '../../../test_utils/assert';
import NumberUpdate from '../NumberUpdate';

interface TestConfigInterface {
  subject: Subject<NumberUpdate>;
}
let config: TestConfigInterface;


describe('Subject::updates', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      subject: new Subject<NumberUpdate>(),
    };
  });

  it('Checks that initially updates collection is empty.', async (): Promise<void> => {
    assert.strictEqual(
      config.subject.updates.length,
      0,
      'Updates are not empty.',
    );
  });

  it('Checks that registered observer is within a collection.', async (): Promise<void> => {
    const update1 = new NumberUpdate(1);
    config.subject.newUpdate(update1);

    assert.strictEqual(
      config.subject.updates.length,
      1,
      'Updates count is not 1.',
    );

    assert.strictEqual(
      config.subject.updates[0],
      update1,
      'Newly added update was not found.',
    );
  });
});
