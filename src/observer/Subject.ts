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

import Logger from '../Logger';
import Comparable from './Comparable';
import Observer from './Observer';

/**
 * The class enables one-to-many dependency between objects, so that
 * when object (subject) changes state, all its dependents (observers) are
 * notified and updated.
 */
export default class Subject<UpdateType extends Comparable<UpdateType>> {
  /* Storage */

  private _observers: Observer<UpdateType>[] = [];

  private _updates: UpdateType[] = [];


  /* Public Functions */

  /** Notifies all observers about change in the subject. */
  public async notify(): Promise<void[]> {
    Logger.debug(`Notifying observers for total ${this._updates.length} updates.`);
    if (this._updates.length === 0) {
      return [];
    }

    const updates = [...this._updates];
    this._updates.length = 0;

    for (let i = 0; i < this._observers.length; i += 1) {
      Logger.debug(`calling service observer ${i + 1}`);
      for(let j=0; j < updates.length; j++) {
        Logger.debug(`calling update on service ${j + 1}`);
        await this._observers[i].update([updates[j]]);
      }
    }
    return Promise.resolve([]);
  }

  public newUpdate(t: UpdateType): void {
    // De-duplicates an existing update.
    const index = this._updates.findIndex(
      (el: UpdateType): boolean => el.compareTo(t) === 0,
    );

    if (index !== -1) {
      this._updates.splice(index, 1);
    }

    this._updates.push(t);
  }

  /**
   * Attaches a new observer to the subject.
   * Throws an error if the specified observer already exists within the class.
   */
  public attach(observer: Observer<UpdateType>): void {
    const observerIndex = this._observers.indexOf(observer);
    if (observerIndex !== -1) {
      throw new Error('The specified observer is already attached.');
    }
    this._observers.push(observer);
  }

  /**
   * Detaches an observer from the subject.
   * Silently ignores if the specified observer does not exist.
   */
  public detach(observer: Observer<UpdateType>): void {
    const observerIndex = this._observers.indexOf(observer);
    if (observerIndex !== -1) {
      this._observers.splice(observerIndex, 1);
    }
  }

  /* Getter for registered observers. */
  public get observers(): Observer<UpdateType>[] {
    return this._observers;
  }

  /* Getter for collected updates. */
  public get updates(): UpdateType[] {
    return this._updates;
  }
}
