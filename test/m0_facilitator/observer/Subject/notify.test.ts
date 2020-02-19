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
import ObserverSpy from '../ObserverSpy';

interface TestConfigInterface {
  subject: Subject<NumberUpdate>;
  observerA: ObserverSpy;
  observerB: ObserverSpy;
}
let config: TestConfigInterface;

describe('Subject::notify', (): void => {
  beforeEach(async (): Promise<void> => {
    config = {
      subject: new Subject<NumberUpdate>(),
      observerA: new ObserverSpy(),
      observerB: new ObserverSpy(),
    };
    config.subject.attach(config.observerA);
    config.subject.attach(config.observerB);
  });

  it('Checks that observers do not get notified if there is no change', async (): Promise<void> => {
    await config.subject.notify();

    assert.isNotOk(
      config.observerA.wasCalled,
      'Observer is not called.',
    );

    assert.isNotOk(
      config.observerB.wasCalled,
      'Observer is not called.',
    );
  });

  it('Checks that observers are notified with proper updates.', async (): Promise<void> => {
    const update1 = new NumberUpdate(1);
    const update2 = new NumberUpdate(2);
    config.subject.newUpdate(update1);
    config.subject.newUpdate(update2);

    await config.subject.notify();

    assert.isOk(
      config.observerA.wasCalled,
      'Observer was called.',
    );

    assert.notStrictEqual(
      config.observerA.spyUpdates.indexOf(update1),
      -1,
      'Observer is notified with the checked update value.',
    );

    assert.notStrictEqual(
      config.observerA.spyUpdates.indexOf(update2),
      -1,
      'Observer is notified with the checked update value.',
    );

    assert.isOk(
      config.observerB.wasCalled,
      'Observer was called.',
    );

    assert.notStrictEqual(
      config.observerB.spyUpdates.indexOf(update1),
      -1,
      'Observer is notified with the checked update value.',
    );

    assert.notStrictEqual(
      config.observerB.spyUpdates.indexOf(update2),
      -1,
      'Observer is notified with the checked update value.',
    );
  });

  it('Checks that updates are cleared from a subject after notifying.', async (): Promise<void> => {
    const update1 = new NumberUpdate(1);
    const update2 = new NumberUpdate(2);
    config.subject.newUpdate(update1);
    config.subject.newUpdate(update2);

    await config.subject.notify();

    assert.strictEqual(
      config.subject.updates.length,
      0,
      'Updates are empty.',
    );
  });
});
