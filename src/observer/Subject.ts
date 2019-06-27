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

import Observer from './Observer';

/**
 * The class enables one-to-many dependency between objects, so that
 * when object (subject) changes state, all its dependents (observers) are
 * notified and updated.
 */
export default class Subject {
  /* Storage */

  private observers: Observer[] = [];


  /* Public Functions */

  /** Notifies all observers about change in the subject. */
  public async notify(): Promise<void[]> {
    const observerNotifyPromises = [];
    for (let i = 0; i < this.observers.length; i += 1) {
      observerNotifyPromises.push(this.observers[i].update());
    }

    return Promise.all(observerNotifyPromises);
  }

  /** Attaches a new observer to the subject. */
  public attach(observer: Observer): void {
    this.observers.push(observer);
  }

  /** Detaches an observer from the subject. */
  public detach(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    this.observers.splice(observerIndex, 1);
  }
}
