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

import Subject from '../../../../src/common/observer/Subject';
import assert from '../../../test_utils/assert';
import NumberUpdate from '../NumberUpdate';
import ObserverSpy from '../ObserverSpy';

interface TestConfigInterface {
  subject: Subject<NumberUpdate>;
}
let config: TestConfigInterface;

describe('Subject::attach', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      subject: new Subject<NumberUpdate>(),
    };
  });

  it('Checks newly added observer exists.', async (): Promise<void> => {
    const observer1 = new ObserverSpy();

    config.subject.attach(observer1);

    assert.notStrictEqual(
      config.subject.observers.indexOf(observer1),
      -1,
      'Newly attached observer does not exist.',
    );

    const observer2 = new ObserverSpy();

    config.subject.attach(observer2);

    assert.notStrictEqual(
      config.subject.observers.indexOf(observer2),
      -1,
      'Newly attached observer does not exist.',
    );
  });

  it('Fails if the specified observer is already attached.', async (): Promise<void> => {
    const observer = new ObserverSpy();

    config.subject.attach(observer);

    assert.throws(
      (): void => config.subject.attach(observer),
      'The specified observer is already attached.',
    );
  });
});
