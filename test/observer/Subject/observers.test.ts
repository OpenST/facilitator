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

import Subject from '../../../src/observer/Subject';
import ObserverSpy from '../ObserverSpy';

import assert = require('assert');

interface TestConfigInterface {
  subject: Subject<number>;
}
let config: TestConfigInterface;

describe('Subject::observers', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      subject: new Subject<number>(),
    };
  });

  it('Checks that initially observers collection is empty.', async (): Promise<void> => {
    assert.strictEqual(
      config.subject.observers.length,
      0,
      'Registered observers collection is not empty.',
    );
  });

  it('Checks that registered observer is within a collection.', async (): Promise<void> => {
    const observer = new ObserverSpy();
    config.subject.attach(observer);

    assert.strictEqual(
      config.subject.observers.length,
      1,
      'Registered observers collection length is not 1.',
    );

    assert.strictEqual(
      config.subject.observers[0],
      observer,
      'Registered observer is not in the subject\'s observers list.',
    );
  });
});
