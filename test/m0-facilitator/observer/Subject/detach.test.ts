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

import Subject from '../../../../src/m0-facilitator/observer/Subject';
import assert from '../../../test_utils/assert';
import NumberUpdate from '../NumberUpdate';
import ObserverSpy from '../ObserverSpy';

interface TestConfigInterface {
  subject: Subject<NumberUpdate>;
}
let config: TestConfigInterface;

describe('Subject::detach', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      subject: new Subject<NumberUpdate>(),
    };
  });

  it('Checks successful removal of an attached observer.', async (): Promise<void> => {
    const observer1 = new ObserverSpy();
    config.subject.attach(observer1);

    const observer2 = new ObserverSpy();
    config.subject.attach(observer2);

    config.subject.detach(observer1);
    assert.strictEqual(
      config.subject.observers.indexOf(observer1),
      -1,
      'Detached observer does not exist.',
    );

    config.subject.detach(observer2);
    assert.strictEqual(
      config.subject.observers.indexOf(observer2),
      -1,
      'Detached observer does not exist.',
    );
  });

  it('Checks silent ignoring of non-attached observer.', async (): Promise<void> => {
    const observer1 = new ObserverSpy();
    config.subject.attach(observer1);

    const observer2 = new ObserverSpy();

    assert.doesNotThrow(
      (): void => config.subject.detach(observer2),
    );
  });
});
